{Base} = require './base'
{Identifier} = require './identifier'
{Assign} = require './assign'
{Operation} = require './operation'

exports.Parens = class Parens extends Base
  prepare: ->
    @op = @create Operation, @nodes...
    @id = @create Identifier, '__tmpvar'
    @assign = @create Assign, @id, @op
    
  type: -> @assign.type()
    
  compile: (b) ->
    @assign.compile(b)
    return "tmlvar:"+@id.get_dependent_variable().name
