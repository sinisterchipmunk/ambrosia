{Base} = require './base'

exports.Literal = class Literal extends Base
  children: -> ['value']
  
  type: ->
    switch typeof @value
      when 'boolean', 'string' then 'string'
      when 'number' then 'integer'
      else throw new Error "Untranslateable literal: #{JSON.stringify @value}"
  
  compile: (builder) ->
    @value.toString()

  to_code: -> JSON.stringify @value
  