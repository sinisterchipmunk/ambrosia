Builtins = (scope) ->
  # TODO support built-in variables
  key for key of scope.defs

class Variable
  constructor: (@name, @type = 'string', @method = false) ->

exports.VariableScope = class Scope
  constructor: (prefix = null, @parent = null) ->
    @prefix = (if parent then parent.prefix else "") + (if prefix then "#{prefix}." else "")
    @defs = {}
    @builtin = Builtins(this)
    @subscopes = []

  define: (name, type, method = false) ->
    (@defs[name] = new Variable(@prefix+name, type, method)).name

  type_of: (value) ->
    value.type()

  lookup: (name) ->
    return @defs[name] if @defs[name]
    if @parent then return @parent.lookup name
    else throw new Error "#{@prefix+name} is not defined"
    
  sub: (prefix) ->
    throw new Error "Can't subscope without a prefix" if !prefix
    scope = new Scope(@prefix+prefix, this)
    @subscopes.push scope
    scope

  compile: (builder) ->
    builder = builder.root if builder.root
    for name, variable of @defs
      builder.vardcl variable.name, variable.type
    for scope in @subscopes
      scope.compile builder
    builder
