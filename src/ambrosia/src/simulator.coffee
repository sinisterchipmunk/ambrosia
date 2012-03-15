{Builtins} = require 'builtins'

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

{ DefaultVariableValue, CastValue, VariableValue, Literalize } = require 'simulator/common'
{ Expression } = require 'simulator/expression'
{ Literalize } = require 'simulator/common'
require 'simulator/all_expressions'
    
exports.Simulator = class Simulator
  KEYS = ("0 1 2 3 4 5 6 7 8 9 f1 f2 f3 f4 f5 f6 f7 f8 f9 up down menu stop enter cancel".split(/\s/))
  KEY_ALIASES = 
    f: 'menu'
  CARDS = {}
  
  @register_card: (name, values) ->
    CARDS[name.toLowerCase()] = values
  
  constructor: (@dom) ->
    if typeof(@dom) == 'string'
      @dom = require('dom').build_dom_from(@dom)
      
    if @dom.name != 'tml' then throw new Error("TML builder required")
    @recursion_depth = 0
    @max_recursion_depth = 10000
    @state =
      flow: []
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
    @state.flow.push screen.attrs.id
    @state.screen.id = screen.attrs.id
    @state.screen.element = screen
    @process_variable_assignments()
    @state.key = "" # reset input key for processing at next screen
    @state.card = null # reset input card for processing at next screen
    # if it's a display or print screen, process the output appropriately
    @state.display = ""
    @state.print or= ""
    if display = @state.screen.element.first 'display'
      @state.display = @process_output_element display
    if print = @state.screen.element.first 'print'
      @state.print += @process_output_element print
      
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
    return false unless @state.screen and @state.screen.element
    
    scr = @state.screen.element
    if scr.first('display') and !@state.key # display screen
      return true

    next = @state.screen.element.first('next')
    if next
      for variant in next.all("variant")
        if variant.attrs['key']
          return !@state.key
      
    # check for card parsers, but only those that require interaction      
    if tform = @state.screen.element.first('tform')
      if card = tform.first('card')
        if card.attrs['parser'] == 'mag' and card.attrs['parser_params'] == 'read_data'
          return !@state.card
          
    # if this is a submit screen, we are waiting for a "response"
    # which will be a whole new batch of TML.
    if scr.first('submit')
      return true
    
    false
    
  # Performs the evaluation on the given variable, and then returns the variable.
  # Ex:
  #   variable = @find_variable "payment.amount"
  #   @evaluate variable, "integer", lo: "tmlvar:payment.amount", op: "plus", ro: 100
  #
  evaluate: (variable, type, attrs) ->
    variable.value = Expression.evaluate type, attrs, @state.variables
    variable.value = parseInt(variable.value) if variable.type == 'integer'
    variable
    
  find_variable: (varname) ->
    variable = @state.variables[varname] or= Builtins.descriptor_for(varname)
    throw new Error "Variable not defined: #{assign.attrs.name}" unless variable
    variable
    
  process_variable_assignments: ->
    for assign in @state.screen.element.all('setvar')
      varname = assign.attrs.name
      variable = @find_variable varname
      type = variable.type
      if assign.attrs.lo and match = /^tmlvar:(.*)$/.exec(assign.attrs.lo.toString())
        if @state.variables[match[1]]
          type = @state.variables[match[1]].type
      @evaluate variable, type, assign.attrs

    @process_form_submission submit if submit = @state.screen.element.first('submit')
      
  process_form_submission: (submit_element) ->
    getvars = submit_element.all('getvar')
    @state.post = path: submit_element.attrs.tgt
    for getvar in getvars
      variable_name = getvar.attrs.name
      @state.post[variable_name] = @state.variables[variable_name].value
  
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
  
  # Enters text on the terminal. If a field can be found on the current
  # screen, text will be entered into it. The field's current value will not
  # be cleared, so the text will be appended to the field's current value.
  # If no field can be found, the text will be entered in the form of button
  # presses on the keypad. If a button press triggers a switch to a screen
  # containing a field, the remainder of the text will be added to the field.
  # If multiple fields are found on the same screen, the text will
  # be entered into the first visible field.
  #
  # After entry, the "ENTER" button on the keypad will be pressed. This can
  # be suppressed by passing a second argument, `false`, which indicates that
  # ENTER should not be pressed.
  #
  enter: (text, press_enter = true, field = @state.screen.element.search('input')[0]) ->
    char = text.charAt(0)
    
    if field
      variable = @find_variable field.attrs.name
      type = if field.attrs.type == 'text' then 'string' else field.attrs.type
      @evaluate variable, type, lo: "tmlvar:#{field.attrs.name}", op: "plus", ro: char
    else
      # normally #press will not raise an error on a useless keypress, but in this
      # case we want it to because the developer at this stage very likely is not
      # on the screen they think they are.
      found = false
      for variant in @state.screen.element.search('variant')
        if variant.attrs['key'] == char
          found = true
      throw new Error "No handler for keypress '#{char}' on this screen" unless found
      @press char
      
    if text.length > 1
      @enter text.substring(1, text.length), press_enter, field
    else
      @press 'enter' if press_enter
  
  # valid keys to be pressed include:
  #     0..9, 00, f1..f9, up, down, menu, stop, enter, cancel
  press: (key) ->
    key = KEY_ALIASES[key.toLowerCase()] if KEY_ALIASES[key.toLowerCase()]
    unless key.toLowerCase() in KEYS
      throw new Error "Invalid key: '#{key}'"
    @state.key = key.toLowerCase()
    @start()
    
  # Follow the link with the given caption. An error will be raised if the link cannot
  # be found.
  follow: (caption) ->
    match = new RegExp("<a([^>]+)>\\s*#{caption}\\s*<\\/a>", "m").exec(@state.display)
    throw new Error "No link visible with caption '#{caption}'" unless match
    target = /href=['"]([^'"]*)['"]/.exec(match[1])
    throw new Error "Anchor with caption '#{caption}' has no href attribute" unless target
    @goto target[1]
    @start()
    
  fill_in: (field, content) ->
    throw new Error "Variable #{field} is not defined" unless @state.variables[field]
    rx = new RegExp("<input [^>]*name=['\"]#{field}[\"']", 'm')
    throw new Error "Field #{field} is not visible on this screen" unless rx.exec(@state.display)
    content = parseInt(content) if @state.variables[field].type == 'integer'
    @state.variables[field].value = content
    
  swipe_card: (name) ->
    @state.card = CARDS[name.toLowerCase()] or throw new Error "No registered card found with type #{name}"
    
    # swiping a card has no effect unless we are waiting for it, BUT
    # we can intuit that if the simulator is not waiting for a card swipe,
    # the simulator is not where the user thinks it is, so we'll raise an
    # error instead.
    if tform = @state.screen.element.first('tform')
      if parser = tform.first('card', parser: "mag", parser_params: "read_data")
        for key, value of @state.card
          @state.variables["card.#{key}"] or= Builtins.descriptor_for("card.#{key}")
          throw new Error "No variable named card.#{key}" unless @state.variables["card.#{key}"]
          @state.variables["card.#{key}"].value = value
        return @start()

    throw new Error "No card parser found on screen #{@state.screen.id}"
  
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
        return if @is_waiting_for_input()
        @step()
        return if @is_waiting_for_input()
        peeked = @peek()
        @resume callback if peeked && peeked != "##{@start_screen.attrs.id}"
      catch e
        if e.message == "waiting for input"
          return
        throw e

Simulator.register_card "visa",
  cardholder_name: "John Smith"
  effective_date: "01/01/2001"
  expiry_date: "01/01/2111"
  issue_number: "N/A"
  issuer_name: "N/A"
  pan: "4111111111111111"
  scheme: "VISA"
