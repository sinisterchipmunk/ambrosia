{Base} = require './base'
{Variable} = require '../variable_scope'
{Identifier} = require './identifier'

exports.Array = class Ary extends Base
  constructor: (@nodes...) ->
    @values = nodes.shift()
    super nodes...

  type: -> 'string'
  
  children: -> []
  get_dependent_variable: -> @values.get_dependent_variable()
  to_code: -> "[#{@real().join(',')}]"
  prepare: ->
  real: -> val.value for val in @values
  compile: (screen) ->
    (val.value for val in @values).join(';')
