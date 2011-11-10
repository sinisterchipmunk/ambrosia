Builtins = (scope) ->
  # TODO support built-in variables
  key for key of scope.defs

debug = (mesg) -> console.log mesg if process.env['DEBUG']

exports.Variable = class Variable
  constructor: (@name, @_type = null, @method = false) ->
    debug "Created variable #{@name}#{if @_type then " with type #{@_type}" else ""}"
    @dependents = []
    
  depends_upon: (other_variable) ->
    # don't depend upon string variables because string is the default type.
    # If no other variables are depended upon, default string will win.
    unless other_variable == this or other_variable.type() == 'string'
      debug "type of #{@name} depends upon #{other_variable.name}"
      @dependents.push other_variable
      
  is_method_reference: -> @last_known_value && @last_known_value.indexOf('#') == 0
    
  type: ->
    if @_type == null && @dependents.length > 0
      # Since the default type is string, take the first non-string type in the dependents list.
      # If all dependents are strings then return string, else return null to signal there's not
      # yet any expressly defined type.
      
      type = null
      for dep in @dependents
        _t = dep.type()
        if _t
          if _t != 'string' then return _t
          else type = 'string'
      # console.log type
      type
    else
      @_type
      
  default_value: ->
    switch @type()
      when 'string', null then ''
      else 0
      
  setType: (type, silenced = false, raise_warnings = false) ->
    if @type() != null and type != null
      # silence warnings about strings because string is the default!
      if @type() != type && @_type != 'string'
        message = "#{type} variable #{@name} conflicts with a #{@type()} variable of the same name"
        if raise_warnings then throw new Error message
        if !silenced then console.log "Warning: #{message}"
    
    if @_type != type # to silence useless debugs
      debug "set type of #{@name} to #{type}"
      @_type = type

exports.VariableScope = class Scope
  constructor: (prefix = null, @parent = null) ->
    @_prefix = (if prefix then "#{prefix}." else "")
    @defs = {}
    @builtin = Builtins(this)
    @subscopes = {}
    
  to_simulator_scope: (sim = {}) ->
    for localname, def of @defs
      sim[def.name] = { type: def.type(), value: def.default_value() }
    for prefix, subscope of @subscopes
      subscope.to_simulator_scope sim
    sim
    
  prefix: ->
    if @parent then @parent.prefix() + @_prefix
    else @_prefix
    
  warnings_silenced: ->
    return true if @_warnings_silenced
    return @parent.warnings_silenced() if @parent
    false
    
  silence_warnings: -> @_warnings_silenced = true
  
  warnings_raised: ->
    return true if @_raise_warnings
    return @parent.warnings_raised() if @parent
    false
    
  raise_warnings: -> @_raise_warnings = true

  # defines the named variable if it doesn't exist; sets its type if its type is null; raises
  # an error if the new type would conflict with the previous (non-null) type; returns the
  # named variable.
  define: (name, type = null, method = false) ->
    if name.indexOf(".") == 0
      return @root().define name[1..-1], type, method
    
    qualified_name = @prefix() + name
    variable = @find(name)
    if variable
      variable.setType type, @warnings_silenced(), @warnings_raised() unless type == null
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
        variable.setType type, true
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
    if prefix[0] == '.'
      return @root().sub prefix[1..-1]
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
