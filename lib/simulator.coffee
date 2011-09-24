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

DefaultVariableValue = (variable) ->
  CastValue variable.attrs.value, variable.attrs.type
    
CastValue = (value, type) ->
  value = (value || "").toString()
  switch type
    when 'integer'
      result = parseInt value
      result = 0 if isNaN(result) or !isFinite(result)
      result
    when 'datetime' then new Date(value)
    when 'opaque', 'string' then value
    else value # TML variable types default to 'string'

VariableValue = (variable_state, varname) ->
  if variable_state[varname] != undefined
    variable_state[varname]
  else
    throw new Error "Undefined variable: #{varname}"
    
Literalize = (variable_state, value, type) ->
  if value.toString()['tmlvar:']
    lvalue = VariableValue(variable_state, value[7..-1])
  else lvalue = CastValue(value, type)
    
ProcessExpression = (variable_state, expr, type) ->
  lvalue = Literalize(variable_state, expr.lo, type)
  unless expr.ro and expr.ro != ''
    return lvalue # no ro means it's a simple assignment
  
  rvalue = Literalize(variable_state, expr.ro, type)
  switch(expr.op)
    when 'plus' then lvalue + rvalue
    when 'minus' then lvalue - rvalue
    else throw "Unrecognized arithmetic operator: #{expr.op}"

exports.Simulator = class Simulator
  constructor: (@dom) ->
    if @dom.name != 'tml' then throw new Error("TML builder required")
    
  init_variables: ->
    for variable in @dom.all("vardcl")
      @state.variables[variable.attrs.name] =
        type: variable.attrs.type or "string"
        value: DefaultVariableValue(variable)
    
  initialize: ->
    @state =
      screen:
        id: null
      variables: {}
    @init_variables()
    if start = @dom.first("screen")
      @goto start.attrs.id
    else throw new Error "No screens found!"
    
  goto: (id) ->
    id = id[1..-1] if id[0] == '#'
    screen = @dom.first("screen", id: id)
    throw new Error "Screen '#{id}' not found!" unless screen
    @state.screen.id = screen.attrs.id
    @state.screen.element = screen
    
  process_variable_assignments: ->
    for assign in @state.screen.element.all('setvar')
      variable = @state.variables[assign.attrs.name]
      variable.value = ProcessExpression(@state.variables, assign.attrs, variable.type)
    
  step: ->
    @process_variants()
    @process_variable_assignments()
    
  find_possible_variants: ->
    candidates = []
    # check for matching conditions
    # the last candidate is the value of <next>
    next = @state.screen.element.first('next')
    if next then next = next.attrs['uri'] else next = @state.screen.element.attrs['next']
    if next then candidates.push next
    candidates
    
  process_variants: ->
    candidates = @find_possible_variants()
    if candidates.length == 0
      throw new Error "Cannot step forward: screen 'idle' is a dead end!"
    else
      @goto candidates[0]

  start: (callback) ->
    @initialize()
    @process_variable_assignments()
    @step() until not callback(this)
