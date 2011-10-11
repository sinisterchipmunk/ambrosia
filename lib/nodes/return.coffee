{Base} = require './base'
{Identifier} = require './identifier'
{Literal} = require './literal'
{Assign} = require './assign'

exports.Return = class Return extends Base
  children: -> ['expression']
  
  to_code: -> "return #{if @expression then @expression.to_code() else ""}"
  
  type: -> if @expression then @expression.type() else null
  
  with: (expr) ->
    @expression = expr
    @expression.parent = this
    this

  compile: (builder) ->
    screen_id = builder.attrs.id
    @expression or= @create Literal, ""
    if type = @expression.type()
      v = @current_scope().define "return", @expression.type()
    else
      v = @current_scope().define "return"
      dependent = @expression.get_dependent_variable()
      v.depends_upon dependent
      
    @create(Assign, @create(Identifier, "return"), @expression).compile builder
