{Base} = require 'nodes/base'
{Identifier} = require 'nodes/identifier'
{Assign} = require 'nodes/assign'
{Operation} = require 'nodes/operation'

exports.Parens = class Parens extends Base
  prepare: ->
    @op = @create Operation, @nodes...
    @id = @create Identifier, '__tmpvar'
    @assign = @create Assign, @id, @op
    
  type: -> @assign.type()
  
  to_code: -> "(#{@op.to_code()})"
    
  compile: (b) ->
    @assign.compile(b)
    return "tmlvar:"+@id.get_dependent_variable().name
