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
    variable = @find(name)
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
    
  find: (name, downward = false) ->
    for localname, def of @defs
      return def if def.name == name or localname == name
    if @parent && !downward
      return @parent.find name, false
    
    # check for qualified names relative to this scope, e.g. prefixed with one of child scope prefixes
    #   root can find one.two.three,
    #   root->one can find two.three,
    #   root->one->two can find three
    for prefix, scope of @subscopes
      prefix = @prefix + prefix
      if name.indexOf(prefix) == 0 # starts with prefix
        return scope.find name, true

    null

  lookup: (name) ->
    throw new Error "No name given" if !name
    return v if v = @find(name)
    throw new Error "#{(if /\./.test name then name else @prefix+name)} is not defined"
    
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
