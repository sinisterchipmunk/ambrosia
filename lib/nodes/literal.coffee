{Base} = require './base'

exports.Literal = class Literal extends Base
  # children: -> ['value']
  constructor: (@value) -> @nodes = []
  
  type: ->
    switch typeof @value
      when 'boolean', 'string' then 'string'
      when 'number' then 'integer'
      when 'undefined' then 'string'
      else throw new Error "Untranslateable literal: #{JSON.stringify @value}"
  
  compile: (builder) ->
    if @value != undefined
      @value.toString()
    else
      "undefined" # or empty string?

  to_code: -> JSON.stringify @value
  