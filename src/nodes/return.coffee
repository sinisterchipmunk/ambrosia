{Base} = require 'nodes/base'
{Identifier} = require 'nodes/identifier'
{Literal} = require 'nodes/literal'
{Assign} = require 'nodes/assign'

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
    assignment = @create(Assign, @create(Identifier, "return"), @expression).compile builder
    
    if type = @expression.type()
      v = @current_scope().define "return", @expression.type()
    else
      v = @current_scope().define "return"
      dependent = @expression.get_dependent_variable()
      v.depends_upon dependent
      
    current = builder.root.current_screen()
    unless current.attrs['id'] == '__main__'
      if next = current.first 'next'
        next.attrs.uri = '#__return__'
      else
        current.attrs.next = '#__return__'
    
    # @create(Assign, @create(Identifier, "return"), @expression).compile builder
    return assignment
