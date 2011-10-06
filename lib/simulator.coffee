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
    @state =
      screen:
        id: null
      variables: {}
    @init_variables()
    if start = @dom.first("screen")
      @goto start.attrs.id
    else throw new Error "No screens found!"
    
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
    @process_variants() # also triggers variable assigns
    
  find_possible_variants: ->
    candidates = []
    next = @state.screen.element.first('next')
    
    # check for matching conditions
    if next
      for variant in next.all("variant")
        if variant.attrs['key']
          throw new Error "TODO: Not implemented: handle keypress variants"
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
      throw new Error "Cannot step forward: screen '#{@state.screen.id}' is a dead end!"
    else
      @goto candidates[0]

  start: (callback) ->
    @step() until not callback(this)
