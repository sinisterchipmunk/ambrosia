{NameRegistry} = require 'tml_builder'
{Extension} = require 'nodes/extension'
{Document} = require 'nodes/document'
{Base} = require 'nodes/base'
{Variable} = require 'variable_scope'

exports.MethodCall = class MethodCall extends Extension
  children: -> ['method_name', 'params']
  
  type: ->
    if variable = @current_scope().find(@getMethodName())
      if variable.is_method_reference()
        return variable.type()

    @root().find_method(@getMethodName()).type(@params)
    
  getMethodName: ->
    return @_method_name if @_method_name
    @_method_name = @method_name.name #compile()
    
  prepare: ->
    # if it's a precompile method, wipe out this instance's compile method so it can do
    # no harm.
    if @getMethodName() == 'raise_warnings' or @getMethodName() == 'silence_warnings'
      # FIXME this is left over from before preprocessors, convert them into proper preprocessors
      @current_scope()[@getMethodName()]()
      @compile = (screen) -> 
    else
      preps = Document.preprocessors
      if preps and prep = preps[@getMethodName()]
        @compile = (b) ->
          result = prep.invoke.call this, b.root, (param.compile b for param in @params)...
          if result instanceof Variable or result instanceof Base
            @type = -> result.type()
            return result.compile b if result.compile
          else if typeof(result) == 'string'
            @type = -> 'string'
          else if typeof(result) == 'number'
            @type = -> 'integer'
          else if result == false
            return MethodCall.prototype.compile.call this, b
          else
            sys = require 'util'
            throw new Error "#{@getMethodName()}: return value of preprocessor invocation must be `false` to pass through, or a String, Number, Variable or compileable instance of Base (got #{sys.inspect result})"
          result
          
  run_prepare_blocks: ->
    super()
    for param in @params
      param.run_prepare_blocks()
  
  get_dependent_variable: ->
    function_screen_id = @getMethodName()
    if variable = @current_scope().find(function_screen_id)
      # no way to guesstimate result because it's defined at runtime
      return null
    else
      method = @root().find_method function_screen_id
      return method.getReturnVariable()
      
  to_code: -> "#{@getMethodName()}(#{(param.to_code() for param in @params).join(', ')})"
    
  compile: (builder) ->
    {Assign} = require 'nodes/assign'
    {Identifier} = require 'nodes/identifier'
    {Literal} = require 'nodes/literal'
    
    screen = builder.root.current_screen()
    function_screen_id = @getMethodName()
    return_screen_id = "#{screen.attrs['id']}_#{builder.root.name_registry.register function_screen_id}"

    # see if it's a local variable *referencing* a method; if so, get the reference instead
    # note we do this *after* calculating return_screen_id; this is so we can reuse the
    # return screen, since it's common code.
    if variable = @current_scope().find(function_screen_id)
      function_screen_id = "tmlvar:#{variable.name}"
      if variable.last_known_value and match = /\#(.*)$/.exec variable.last_known_value
        method = @root().find_method match[1]
    else
      method = @root().find_method function_screen_id
      throw new Error "Invalid parameter count: #{@params.length} for #{method.params.length}" if @params.length != method.params.length
      
    param_list = []
    for i in [0...@params.length]
      param = @params[i]
      variable = param_type = null
      # @create(Assign, @create(Identifier, ".__method_param_#{i}"), param).compile(screen.root.current_screen())

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
        if variable then v.depends_upon variable
        @assign screen, v.name, param
      else
        @current_scope().silently_define ".__generic_method_param_#{i}", 'string'
        @assign screen, ".__generic_method_param_#{i}", param

    @assign screen, ".__generic_method", true if !method
    # @current_scope().define ".__method_params", 'string'
    # @assign screen, ".__method_params", param_list.join ";"
    screen.root.current_screen().call_method function_screen_id, return_screen_id

    # create the return screen and link into it
    dest = screen.root.screen return_screen_id
    screen.attrs.next = "##{dest.attrs.id}"
    # if the method is known, return its return variable
    if method then method.getReturnVariable()
    else null
