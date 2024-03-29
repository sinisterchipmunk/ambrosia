{Base} = require 'nodes/base'
{Block} = require 'nodes/block'
{If} = require 'nodes/if'
{Identifier} = require 'nodes/identifier'
{MethodReference} = require 'nodes/method_reference'
{Operation} = require 'nodes/operation'
{Literal} = require 'nodes/literal'
{Assign} = require 'nodes/assign'

exports.Method = class Method extends Base
  children: -> ['name', 'params', 'block']
  
  instance_name: ->
    super + "<#{@getID()}>"
    
  to_code: ->
    code = "#{@getID()}(#{(param.to_code() for param in @params).join(', ')}):"
    if @block then "#{code}\n#{@block.to_code()}"
    else code
  
  after_initialize: ->
    @params or= []
    if @name instanceof Identifier
      @name = @name.name
    if @getID() == '__main__' 
      @next = "#__main__"
    else
      @next = "#__return__"
      
  getID: ->
    @id or= @name
    if @id
      @id
    else
      throw new Error "Method needs a name"
    
  type: (params) ->
    @current_scope().define('return', null).type()

  current_scope: () ->
    return @scope if @scope
    id = @getID()
    @scope = super()
    if id != '__main__'
      @scope = @scope.sub id
    @scope
    
  getReturnVariable: ->
    @current_scope().define "return"

  prepare: ->
    id = @getID()
    throw new Error "Duplicate method: #{id}" if @root().methods[id]
    @root().methods[id] = this
    @current_scope().define ".__method_params", 'string'
    @current_scope().define param.name, null for param in @params
  
  compile: (builder) ->
    if @compiled then return @method_reference
    else @compiled = true
    previous = builder.root.current_screen() || {attrs:id:"__main__"}
    screen = builder.root.screen @getID()
    screen.attrs.next = @next
    
    # clear the call stack if this is the __main__ method
    if @getID() == '__main__'
      @create(Assign, @create(Identifier, ".call.stack"), @create(Literal, "")).compile builder
    
    assigns = []

    # compile a check to see if the method was called anonymously. If so, we need to extract the
    # params from the generic parms variables.
    if @params.length > 0
      for index in [0...@params.length]
        param = @params[index]
        varname = ".__generic_method_param_#{index}"
        @current_scope().silently_define ".__generic_method_param_#{index}", 'string'
        assigns.push @create Assign, @create(Identifier, param.name), @create(Identifier, varname)
      block = @create Block, assigns
      _true = @create Literal, true
      varname = @create Identifier, '.__generic_method'
      @current_scope().define '.__generic_method'
      _if = @create(If, @create(Operation, varname, '==', _true), block)
      builder.root.current_screen()
      _if.compile(builder.root.current_screen()).toString()

      @create(Assign, varname, @create(Literal, false)).compile builder.root.current_screen()
    @block.compile builder.root.current_screen() if @block
    builder.root.add_return_screen()
    builder.root.goto previous.attrs.id
    
    # Build a method reference as a return value.
    # This can be used by Assigns.
    @method_reference = @create(MethodReference, new Literal @getID()).compile builder
