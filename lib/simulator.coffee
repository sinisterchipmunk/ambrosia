# Simulator for testing TML documents. An assumption is made that the TML is valid
# to begin with. At each step of the simulation, a user-supplied callback will be
# fired. If the callback returns a non-true value, the simulation is halted.
#
# Example usage:
#
#    tml = new Builder 'tml'
#    # ...
#    sim = new Simulator tml
#    sim.start ->
#      if sim.state.screen.id == "init"
#        return true # continue to next step
#      else
#        return false # halt execution
#

{ DefaultVariableValue, CastValue, VariableValue, Literalize } = require './simulator/common'
{ Expression } = require './simulator/expression'
{ Literalize } = require './simulator/common'
require './simulator/all_expressions'
    
exports.Simulator = class Simulator
  constructor: (@dom) ->
    if @dom.name != 'tml' then throw new Error("TML builder required")
    @recursion_depth = 0
    @max_recursion_depth = 10000
    @state =
      screen:
        id: null
      variables: {}
    @init_variables()
    unless @start_screen = @dom.first("screen")
      throw new Error "No screens found!"
    
  init_variables: ->
    for variable in @dom.all("vardcl")
      @state.variables[variable.attrs.name] =
        type: variable.attrs.type or "string"
        value: DefaultVariableValue(variable)
      
  goto: (id) ->
    if match = /^tmlvar:(.*)$/.exec id
      id = id.replace match[0], @state.variables[match[1]].value
    id = id[1..-1] if id[0] == '#'
    screen = @dom.first("screen", id: id)
    throw new Error "Screen '#{id}' not found!" unless screen
    @state.screen.id = screen.attrs.id
    @state.screen.element = screen
    @process_variable_assignments()
    @state.key = "" # reset input key for processing at next screen
    # if it's a display or print screen, process the output appropriately
    @state.display = ""
    @state.print or= ""
    if display = @state.screen.element.first 'display'
      @state.display = @process_output_element display
      
  process_output_element: (e) ->
    str = "" + (sub.toString(false) for sub in e.all())
    while match = /<getvar(.*?)\/?\s*>/.exec str
      attrs = {}
      for attr in match[1].trim().split(' ')
        [key, value] = attr.split '='
        attrs[key] = value[1..-2]
      
      variable = @state.variables[attrs['name']]
      result = variable.value

      str = str.replace match[0], result
    str
  
  is_waiting_for_input: ->
    scr = @state.screen.element
    if scr.first 'display' # display screen
      return true

    next = @state.screen.element.first('next')
    if next
      for variant in next.all("variant")
        if variant.attrs['key']
          unless @state.key
            return true
    false
    
  process_variable_assignments: ->
    for assign in @state.screen.element.all('setvar')
      variable = @state.variables[assign.attrs.name]
      type = variable.type
      if assign.attrs.lo and match = /^tmlvar:(.*)$/.exec(assign.attrs.lo.toString())
        if @state.variables[match[1]]
          type = @state.variables[match[1]].type
      variable.value = Expression.evaluate type, assign.attrs, @state.variables
      variable.value = parseInt(variable.value) if variable.type == 'integer'
      
  step: ->
    if !@state.screen.element # first screen
      @goto @start_screen.attrs.id
    else
      if ++@recursion_depth > @max_recursion_depth
        throw new Error "Recursion error!"
      @process_variants() # also triggers variable assigns
    
  find_possible_variants: ->
    candidates = []
    next = @state.screen.element.first('next')
    
    # check for matching conditions
    if next
      for variant in next.all("variant")
        if variant.attrs['key']
          if @state.key
            return [variant.attrs['uri']] if @state.key == variant.attrs['key']
          else
            throw new Error "waiting for input"
        else
          result = Expression.evaluate "boolean", variant.attrs, @state.variables
          candidates.push variant.attrs['uri'] if result

    # the last candidate is the value of <next>
    next = (next and next.attrs['uri']) or @state.screen.element.attrs['next']
    candidates.push next if next
    
    # finally, convert candidates which are references to TML variables into their values
    candidates = for candidate in candidates
      if /^tmlvar:/.test candidate then Literalize(@state.variables, candidate, 'string')
      else candidate
    
    candidates
    
  process_variants: ->
    candidates = @find_possible_variants()
    if candidates.length == 0
      # throw new Error "Cannot step forward: screen '#{@state.screen.id}' is a dead end!"
    else
      @goto candidates[0]

  start: (callback) -> @resume callback
  
  # valid keys to be pressed include:
  #     0..9, 00, f1..f9, up, down, menu, stop, enter, cancel
  press: (key) ->
    unless key in ("0 1 2 3 4 5 6 7 8 9 f1 f2 f3 f4 f5 f6 f7 f8 f9 up down menu stop enter cancel".split(/\s/))
      throw new Error "Invalid key: '#{key}'"
    @state.key = key
    @start()
  
  # peek at next screen. This avoids setting variables by actually visiting it.
  peek: ->
    @find_possible_variants()[0]

  resume: (callback) ->
    @recursion_depth = 0
    if callback
      @step()
      @resume callback if callback(this) && @peek()
    else
      try
        @step()
        return if @is_waiting_for_input()
          # throw new Error "waiting for input"
        peeked = @peek()
        @resume callback if peeked && peeked != "##{@start_screen.attrs.id}"
      catch e
        if e.message == "waiting for input"
          return
        else throw e
