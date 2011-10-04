Builtins = (scope) ->
  # TODO support built-in variables
  key for key of scope.defs

exports.Variable = class Variable
  constructor: (@name, @_type = null, @method = false) ->
    
  depends_upon: (@other_variable) ->
    
  type: ->
    if @_type == null && @other_variable
      @other_variable.type()
    else
      @_type
      
  setType: (t) -> @_type = t

exports.VariableScope = class Scope
  constructor: (prefix = null, @parent = null) ->
    @prefix = (if parent then parent.prefix else "") + (if prefix then "#{prefix}." else "")
    @defs = {}
    @builtin = Builtins(this)
    @subscopes = {}

  define: (name, type = null, method = false) ->
    qualified_name = @prefix + name
    variable = @defs[name]
    if variable
      if variable.type() == null
        variable.setType type
      else
        if type != null and variable.type() != type
          throw new Error "#{type} variable #{qualified_name} conflicts with a #{variable.type()} variable of the same name"
    else
      @defs[name] = variable = new Variable(qualified_name, type, method)
      
    variable

  type_of: (value) ->
    value.type()

  lookup: (name, raiseError = true, downward = false) ->
    throw new Error "No name given" if !name
    
    for localname, def of @defs
      return def if def.name == name or localname == name
      
    if @parent && !downward
      v = @parent.lookup name, false
    else if /\./.test name
      v = null
      for prefix, scope of @subscopes
        v = scope.lookup name, false, true
        break if v
    
    if !v && raiseError
      throw new Error "#{(if /\./.test name then name else @prefix+name)} is not defined"
    return v
    
  sub: (prefix) ->
    throw new Error "Can't subscope without a prefix" if !prefix
    @subscopes[@prefix+prefix] = new Scope(@prefix+prefix, this)

  compile: (builder) ->
    builder = builder.root if builder.root
    for name, variable of @defs
      throw new Error "No type for variable #{name}" if !variable.type()
      builder.vardcl variable.name, variable.type()
    for prefix, scope of @subscopes
      scope.compile builder
    builder
