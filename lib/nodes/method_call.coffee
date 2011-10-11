{NameRegistry} = require '../tml_builder'
{Base} = require './base'
{Identifier} = require './identifier'
{Require} = require './require'
{Literal} = require './literal'
{Assign} = require './assign'

exports.MethodCall = class MethodCall extends Base
  children: -> ['method_name', 'params']
  
  type: ->
    @root().find_method(@getMethodName()).type(@params)
    
  getMethodName: ->
    return @_method_name if @_method_name
    @_method_name = @method_name.name #compile()
    
  prepare: ->
    # if it's a precompile method, wipe out this instance's compile method so it can do
    # no harm. TODO make this more flexible.
    if @getMethodName() == 'require'
      @require = @create Require, (param.name for param in @params)...
      @compile = (screen) -> @require.compile screen.root
  
  get_dependent_variable: ->
    function_screen_id = @getMethodName()
    if variable = @current_scope().find(function_screen_id)
      # no way to guesstimate result because it's defined at runtime
      return null
    else
      method = @root().find_method function_screen_id
      return method.getReturnVariable()
    
  compile: (builder) ->
    screen = builder.root.current_screen()
    function_screen_id = @getMethodName()
    return_screen_id = "#{screen.attrs['id']}_#{NameRegistry.register function_screen_id}"

    # see if it's a local variable *referencing* a method; if so, get the reference instead
    # note we do this *after* calculating return_screen_id; this is so we can reuse the
    # return screen, since it's common code.
    if variable = @current_scope().find(function_screen_id)
      function_screen_id = "tmlvar:#{variable.name}"
    else
      method = @root().find_method function_screen_id
      throw new Error "Invalid parameter count: #{@params.length} for #{method.params.length}" if @params.length != method.params.length
      
    param_list = []
    for i in [0...@params.length]
      param = @params[i]
      variable = param_type = null
      if param instanceof Identifier
        # use variable's fully qualified name to avoid scoping issues in method
        variable = param.get_dependent_variable()
        param_list.push "tmlvar:#{variable.name}"
      else
        param_list.push param.compile screen
        param_type = param.type()

      if method
        param_name = method.params[i].name
        v = method.current_scope().define param_name, param_type
        if variable
          v.depends_upon variable

    @current_scope().define ".__method_params", 'string'
    @create(Assign, @create(Identifier, ".__method_params"), @create(Literal, param_list.join ";")).compile(screen)
    screen.root.current_screen().call_method function_screen_id, return_screen_id

    # create the return screen and link into it
    dest = screen.root.screen return_screen_id
    screen.attrs.next = "##{dest.attrs.id}"
    # if the method is known, return its return variable
    if method then method.getReturnVariable()
    else null
