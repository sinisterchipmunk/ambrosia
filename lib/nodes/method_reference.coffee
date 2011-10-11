{Base} = require './base'
{Identifier} = require './identifier'

exports.MethodReference = class MethodReference extends Base
  children: -> ['value']
  type: -> "string"
  
  to_code: -> ":#{@value.to_code()}"
  
  compile: (builder) ->
    if @value instanceof Identifier
      "##{@value.name}"
    else
      "##{@value.compile builder}"
