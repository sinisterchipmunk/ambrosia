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
  while match = /tmlvar:([^;]+)/.exec(value.toString())
    # console.log match, "::"
    # v = VariableValue(variable_state, value[7..-1]).value
    v = VariableValue(variable_state, match[1]).value
    # console.log value
    value = value.replace(match[0], v)
    # console.log match[0].offset, match[0], match[0].length
    # value = value.substring(0, match.offset) + v + value.substring(match.offset + match[0].length, value.length)
    # value[match.offset...(match.offset+7)] = ""
    # v
  # else
  CastValue(value, type)
