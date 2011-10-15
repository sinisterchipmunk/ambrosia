{Base} = require './base'
{Assign} = require './assign'

# An Extension is a node that is accompanied by code generated directly
# from the scripting language itself.
exports.Extension = class Extension extends Base
  # Defines dependencies. Dependencies are expected to be listed in
  # underscored_format, which corresponds to their file names, and
  # will be expanded into objects named in CamelCaseFormat in the
  # current scope.
  #
  # Example:
  #
  #      @depend 'method_call'
  #      @create MethodCall, ...
  #
  depend: (deps...) ->
    for dep in deps
      camel = dep
      while match = /((^[a-z])|(_[a-z]))/.exec camel
        camel = camel.replace match[1], match[1][match[1].length-1].toUpperCase()
      if eval("typeof #{camel}") == 'undefined'
        eval "#{camel} = require('./#{dep}').#{camel}"
    
  
  # Call from @compile to include scripting code and insert it into the builder
  # Example:
  # 
  #     compile: (builder) ->
  #       @require builder, "path/to/script"
  #       # do other stuff
  #
  require: (builder, path) ->
    current_screen = builder.root.current_screen().attrs.id
    throw new Error "path is required" unless path
    @invoke builder, "require", path
    builder.root.goto current_screen
  
  # Causes the compiler to invoke the specified method with the given arguments
  # Example:
  #   
  #     compile: (builder) ->
  #       @invoke builder, 'method_name', arg1, arg2, argN
  #
  # Note that the arguments are expected to be instances of Base, or string or
  # numeric literals. If they are the latter, they will be converted into
  # instances of Literal. The method name should be a simple String, which will
  # be converted into an instance of Identifier, or any instance of Base.
  invoke: (builder, method_name, args...) ->
    @depend 'literal', 'method_call', 'identifier'
    self = this
    proc = (arg, type = Literal) -> if arg instanceof Base then arg else self.create type, arg
    args = (proc arg for arg in args)
    method_name = proc method_name, Identifier
    
    @create(MethodCall, method_name, args).compile builder

  # Creates a method reference to the named method. If the name is an instance of
  # Base, it will be passed into @create directly. Otherwise, it will be converted
  # to an instance of Literal. The reference is returned.
  #
  # This is similar to the scripting language equivalent of:
  #
  #    :method_name
  #
  method: (name) ->
    @depend 'method_reference'
    if name instanceof Base
      @create MethodReference, name
    else
      @depend 'literal'
      @create MethodReference, @create Literal, name
    
  # Creates and compiles an instance of Assign so that a variable is assigned a value,
  # generating code equivalent to `a = b`.
  #
  # If lvalue is a String, it will be converted into an instance of Identifier. Otherwise,
  # it is used as-is. The rvalue is expected to be an instance of Base. Otherwise, it will
  # be converted to an instance of Literal.
  #
  # Examples:
  # 
  #     @assign builder, "variable_name", 100
  #
  assign: (builder, lvalue, rvalue) ->
    @depend 'identifier', 'literal', 'base'
    lvalue = @create Identifier, lvalue unless lvalue instanceof Base
    rvalue = @create Literal, rvalue    unless rvalue instanceof Base
    @create(Assign, lvalue, rvalue).compile builder
  