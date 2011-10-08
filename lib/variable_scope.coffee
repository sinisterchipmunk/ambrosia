Builtins = (scope) ->
  # TODO support built-in variables
  key for key of scope.defs

exports.Variable = class Variable
  constructor: (@name, @_type = null, @method = false) -> @dependents = []
    
  depends_upon: (other_variable) ->
    @dependents.push other_variable unless other_variable == this
    
  type: ->
    if @_type == null && @dependents.length > 0
      type = null
      for dep in @dependents
        if type
          other = dep.type()
          throw new Error "#{@name} (a #{type}) depends upon #{dep.name}, but it is a #{other}" if type != other
        else
          type = dep.type()
      type
    else
      @_type
      
  setType: (t) -> @_type = t

exports.VariableScope = class Scope
  constructor: (prefix = null, @parent = null) ->
    @_prefix = (if prefix then "#{prefix}." else "")
    @defs = {}
    @builtin = Builtins(this)
    @subscopes = {}
    
  prefix: ->
    if @parent then @parent.prefix() + @_prefix
    else @_prefix

  # defines the named variable if it doesn't exist; sets its type if its type is null; raises
  # an error if the new type would conflict with the previous (non-null) type; returns the
  # named variable.
  define: (name, type = null, method = false) ->
    if name.indexOf(".") == 0
      return @root().define name[1..-1], type, method
    
    qualified_name = @prefix() + name
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
    
  # defines the named variable if it doesn't exist; sets its type if its type is null; otherwise
  # doesn't do anything. Returns the named variable.
  silently_define: (name, type = null, method = false) ->
    if name.indexOf(".") == 0
      return @root().silently_define name[1..-1], type, method

    variable = @find name
    if variable
      if variable.type == null
        variable.setType type
    else
      @defs[name] = variable = new Variable(@prefix() + name, type, method)
    variable

  type_of: (value) ->
    value.type()
    
  # recalculates the fully-qualified variable names of all variables from this scope downward
  # call this when a prefix changes somewhere in the tree at or above this scope
  recalculate: ->
    for localname, def of @defs
      def.name = @prefix()+localname
    for prefix, subscope of @subscopes
      subscope.recalculate()
    
  find: (name, downward = false) ->
    if name.indexOf(".") == 0
      return @root().find name[1..-1], downward

    for localname, def of @defs
      return def if def.name == name or localname == name
    if @parent && !downward
      return @parent.find name, false
    
    # check for qualified names relative to this scope, e.g. prefixed with one of child scope prefixes
    #   root can find one.two.three,
    #   root->one can find two.three,
    #   root->one->two can find three
    for prefix, scope of @subscopes
      prefix = @prefix() + prefix
      if name.indexOf(prefix) == 0 # starts with prefix
        return scope.find name, true

    null
    
  root: () ->
    p = this
    _p = p.parent
    while _p
      p = _p
      _p = p.parent
    p
  
  tree: () ->
    @root().dump()
  
  dump: ->
    for localname, variable of @defs
      console.log @prefix()+localname+" => "+variable.name
      
    for prefix, subscope of @subscopes
      subscope.dump()

  lookup: (name) ->
    throw new Error "No name given" if !name
    return v if v = @find(name)
    throw new Error "#{(if /\./.test name then name else @prefix()+name)} is not defined"
    
  sub: (prefix) ->
    throw new Error "Can't subscope without a prefix" if !prefix
    scope = new Scope(prefix, this)
    @subscopes[scope.prefix()] = scope

  compile: (builder) ->
    builder = builder.root if builder.root
    for name, variable of @defs
      # throw new Error "No type for variable #{name}" if !variable.type()
      builder.vardcl variable.name, variable.type() || "string"
    for prefix, scope of @subscopes
      scope.compile builder
    builder
