{Base} = require './base'
{Identifier} = require './identifier'

exports.MethodReference = class MethodReference extends Base
  children: -> ['value']
  type: -> "string"
  
  compile: (builder) ->
    if @value instanceof Identifier
      "##{@value.name}"
    else
      "##{@value.compile builder}"
