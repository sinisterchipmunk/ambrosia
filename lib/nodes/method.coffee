{Base} = require './base'
{Block} = require './block'
{If} = require './if'
{Identifier} = require './identifier'
{MethodReference} = require './method_reference'
{Operation} = require './operation'
{Literal} = require './literal'
{Assign} = require './assign'

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
    @next = "#__return__"
    if @name instanceof Identifier
      @name = @name.name
      
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
    # this is to counter an error where method bodies are compiled twice. Remove this when
    # the compile phase solidifies.
    if @compiled then throw new Error "Already compiled method #{@getID()} (#{@node_tree()})"
    else @compiled = true
    previous = builder.root.current_screen() || {attrs:id:"__main__"}
    screen = builder.root.screen @getID()
    screen.attrs.next = @next
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
    builder.root.goto previous.attrs.id
    # console.log builder.root.toString()
    
    # Build a method reference as a return value.
    # This can be used by Assigns.
    @create(MethodReference, new Literal @getID()).compile builder
