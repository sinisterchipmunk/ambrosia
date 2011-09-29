exports.DefaultVariableValue = DefaultVariableValue = (variable) ->
  CastValue variable.attrs.value, variable.attrs.type
    
exports.CastValue = CastValue = (value, type) ->
  value = (if value == undefined then "" else value).toString()
  switch type
    when 'integer'
      result = parseInt value
      result = 0 if isNaN(result) or !isFinite(result)
      result
    when 'datetime' then new Date(value)
    when 'opaque', 'string' then value
    else value # TML variable types default to 'string'

exports.VariableValue = VariableValue = (variable_state, varname) ->
  variable = variable_state[varname]
  throw new Error "Undefined variable: #{varname}" if variable == undefined
  variable
    
    
exports.Literalize = Literalize = (variable_state, value, type) ->
  if /^tmlvar:/.test(value.toString())
    CastValue(VariableValue(variable_state, value[7..-1]).value, type)
  else
    CastValue(value, type)
