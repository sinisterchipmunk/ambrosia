{TMLBuilder, NameRegistry} = require './tml_builder'
{VariableScope, Variable}  = require './variable_scope'
TML = require './tml'
path = require 'path'
fs = require 'fs'

exports.Base = class Base
  constructor: (@nodes...) ->
    nodes = @nodes
    self = this
    children = @children() if @children
    
    setParent = (node) ->
      node.parent = self
      if node instanceof Array
        setParent n for n in node
      
    for index in [0...nodes.length]
      node = nodes[index]
      setParent node
      if children && children[index] != undefined
        self[children[index]] = node
    @after_initialize() if @after_initialize
  
  create: (klass, args...) ->
    child = new klass args...
    child.parent = this
    # need to do this right away since child is created after parent already exists
    child.run_prepare_blocks()
    child
    
  run_prepare_blocks: ->
    return if @prepared
    @prepared = true
    @prepare() if @prepare
    for node in @nodes
      node.run_prepare_blocks() if node instanceof Base
  
  children: -> []
  
  compile: -> throw new Error "no compiler for node"
  
  type: -> throw new Error "node has no type"
  
  instance_name: ->
    @__proto__.constructor.name
  
  node_tree: ->
    if @parent then @parent.node_tree() + "::" + @instance_name()
    else @instance_name()
  
  current_scope: ->
    return @scope if @scope
    try
      return @parent.current_scope() if @parent
    catch e
      if match = /BUG: No scope! \(in (.*)\)$/.exec(e.toString())
        throw new Error "BUG: No scope in parent<#{match[1]}> (reraised by #{@node_tree()})"
      else throw e
    throw new Error "BUG: No scope! (in #{@node_tree()})"
    
  # if the reference is the name of a TML variable, the reference tag "tmlvar:" is prepended
  # to the return value.
  tml_variable: (field, builder) ->
    if field instanceof Identifier
      val = field.compile builder
      val = "tmlvar:#{val.name}"
    else
      val = field.compile builder
    
    val
    
  root: ->
    p = this
    while p
      parent = p
      p = p.parent
    parent
 
exports.Require = class Require extends Base
  children: -> ['path']
  
  prepare: ->
    @namespace = @path
    @namespace = @namespace.replace match[0], '.' while match = /[\/\\]/.exec @namespace
    @path = @path + ".tsl" if path.extname(@path) == ""
    @path = path.join(__dirname, @path) unless @path[0] == '/' or @path[0] == '\\'

    return if @root().__dependencies[@path]
    @code = fs.readFileSync @path, 'UTF-8'
    @doc = TML.parse @code
    @doc.scope = @current_scope().sub @namespace

    @root().__dependencies[@path] = @doc

    @doc.run_prepare_blocks()
    
  compile: (builder) ->
    @doc.compile builder
  
exports.Document = class Document extends Base
  constructor: (nodes...) ->
    @scope = new VariableScope
    @methods = {}
    @__dependencies = {}
    super
    
  instance_name: ->
    @current_scope().prefix() + super
  
  silently_find_method: (name) ->
    return @methods[name] if @methods[name]
    retval = null
    @each_dependency (dep) -> 
      retval or= method if method = dep.silently_find_method name
    retval
    
  each_dependency: (callback) ->
    for dep, doc of @__dependencies
      callback doc
  
  find_method: (name) ->
    return method if method = @silently_find_method name
    throw new Error "No method named #{name}"
    
  children: -> ['block']
  
  prepare: ->
    @each_dependency (dep) ->
      dep.run_prepare_blocks()
      
  compileDOM: (builder = new TMLBuilder) ->
    # it's safe to call this repeatedly because `Base` will ignore subsequent calls
    @run_prepare_blocks()
    @find_method('__main__').compile builder
    # important to compile scopes last, because method nodes are still building them until now
    @current_scope().compile builder    
    builder
      
  compile: (builder) ->
    @compileDOM(builder).toString()

exports.Block = class Block extends Base
  constructor: (nodes) -> super(nodes...)
  
  compile: (builder) ->
    for node in @nodes
      node.compile builder
      
  push: (node) ->
    node.parent = this
    @nodes.push node
    node.run_prepare_blocks() if @root() instanceof Document # is doc construction complete?
    
  concat: (ary) ->
    for node in ary
      @push node
      
  nodes_matching: (name) ->
    ary = []
    for node in @nodes
      ary.push node if node.__proto__.constructor.name == name
    ary
  
  # Wrap up the given nodes as a **Block**, unless it already happens
  # to be one.
  @wrap: (nodes) ->
    return nodes[0] if nodes.length is 1 and nodes[0] instanceof Block
    new Block nodes

exports.Literal = class Literal extends Base
  children: -> ['value']
  
  type: ->
    switch typeof @value
      when 'string' then 'string'
      when 'boolean', 'number' then 'integer'
      else throw new Error "Untranslateable literal: #{JSON.stringify @value}"
  
  compile: (builder) -> @value.toString()

exports.Method = class Method extends Base
  children: -> ['name', 'params', 'block']
  
  instance_name: ->
    super + "<#{@getID()}>"
    
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
    for index in [0...@params.length]
      param = @params[index]
      asgn = @create Assign, @create(Identifier, param.name), @create(Operation, @create(Identifier, ".__method_params"), 'item', @create(Literal, index))
      asgn.compile screen
    @block.compile screen if @block
    builder.root.goto previous.attrs.id
    
    # Build a method reference as a return value.
    # This can be used by Assigns.
    @create(MethodReference, new Literal @getID()).compile builder

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
        variable = param.compile screen
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
  
exports.Parens = class Parens extends Base
  prepare: ->
    @op = @create Operation, @nodes...
    @id = @create Identifier, '__tmpvar'
    @assign = @create Assign, @id, @op
    
  type: -> @assign.type()
    
  compile: (b) ->
    @assign.compile(b)
    return @tml_variable @id, b
    
exports.ListIndex = class ListIndex extends Base
  type: -> 'string'
  
  children: -> ['list', 'index']
  
  compile: (screen) ->
    @create(Operation, @list, 'item', @index).compile screen

exports.Assign = class Assign extends Base
  type: -> @rvalue.type()
  
  children: -> ['lvalue', 'rvalue']
  
  prepare: ->
  compile: (screen) ->
    throw new Error "Can't use assignment as left value" if @lvalue instanceof Assign
      
    rval = @rvalue.compile screen.root.current_screen()
    screen = screen.root.current_screen()

    type = @rvalue.type()
    lval = @current_scope().silently_define @lvalue.name, type
    
    setvar = screen.b 'setvar', name: lval.name
    @lvalue.assign_value setvar, rval

    lval

exports.Operation = class Operation extends Base
  children: -> ['lvalue', 'op', 'rvalue']
  
  type: -> @lvalue.type()
  
  get_dependent_variable: ->
    if @lvalue instanceof Base
      @lvalue.get_dependent_variable()
    else
      null
  
  prepare: ->
    # if op is > or >= then TML doesn't support that, so reverse the operands and the op
    if @op && @op.indexOf(">") != -1
      [@lvalue, @rvalue] = [@lvalue, @rvalue]
      if @op.indexOf '=' != -1 then @op = '<'
      else                          @op = '<='
    
  compile: (screen) ->
    self = this
    proc = (w, val) ->
      if val instanceof Operation
        id = self.create Identifier, "__tmp#{w}"
        self.create(Assign, id, val).compile(screen)
        return id
      else val
    
    lval = @tml_variable proc('l', @lvalue), screen
    return lval unless @rvalue
    rval = @tml_variable proc('r', @rvalue), screen

    result = 
      lo: lval
      ro: rval
      op: switch @op
        when '+' then 'plus'
        when '-' then 'minus'
        when '==' then 'equal'
        when '!=' then 'not_equal'
        when '<=' then 'less_or_equal'
        when '<' then 'less'
        else @op
        
    if @op == '%'
      result.format = result.ro
      delete result.ro
      delete result.op
    result
  
exports.Identifier = class Identifier extends Base
  children: -> ['name']
  type: -> @get_dependent_variable().type()
  compile: (b) -> @get_dependent_variable()
  get_dependent_variable: -> @current_scope().lookup @name

  assign_value: (setvar, val) ->
    _var = @current_scope().define @name
    if val instanceof Variable
      _var.depends_upon val
      setvar.attrs.lo = "tmlvar:#{val.name}"
    else if typeof(val) == 'object'
      setvar.attrs.lo = val.lo
      if val.format != undefined then setvar.attrs.format = val.format
      else if val.ro != undefined
        setvar.attrs.ro = val.ro
        setvar.attrs.op = val.op
      else throw new Error "Can't assign variable #{_var.name} to no value (#{JSON.stringify val})"
    else
      setvar.attrs.lo = val
    setvar
    
  
exports.MethodReference = class MethodReference extends Base
  children: -> ['value']
  type: -> "string"
  
  compile: (builder) ->
    if @value instanceof Identifier
      "##{@value.name}"
    else
      "##{@value.compile builder}"

exports.Return = class Return extends Base
  children: -> ['expression']
  
  type: -> if @expression then @expression.type() else null
  
  with: (expr) ->
    @expression = expr
    @expression.parent = this
    this

  compile: (builder) ->
    screen_id = builder.attrs.id
    @expression or= @create Literal, ""
    if type = @expression.type()
      v = @current_scope().define "return", @expression.type()
    else
      v = @current_scope().define "return"
      dependent = @expression.get_dependent_variable()
      v.depends_upon dependent
      
    @create(Assign, @create(Identifier, "return"), @expression).compile builder

# Supported conditional variants include any combination of the following:
#
#     if i == 1
#       doSomething()
#     else if i == 2
#       whatever()
#     else
#       doSomethingElse()
#
#     if i == 1 then doSomething() else if i == 2 then whatever() else doSomethingElse()
#
#     if i == 1 then doSomething()
#     else if i == 2 then whatever()
#     else doSomethingElse()
#
#     doSomething() if i == 1
#     doSomething() unless i == 1
#
exports.If = class If extends Base
  # @if_type is either 'if' or 'unless'.
  children: -> ['expression', 'block', 'if_type']
  
  addElse: (block) ->
    @else_exp = block
    @else_exp.parent = this
    this
  
  compile: (builder) ->
    if @expression instanceof Operation
      op = @expression
    else
      if @expression.type() == 'integer'
        op = @create Operation, @expression, "not_equal", "0"
      else
        op = @create Operation, @expression, "not_equal", ""
  
    screen = builder.root.current_screen()
    screen = screen.branch op.compile screen
    @block.compile screen
    screen = @else_exp.compile screen.branch_else() if @else_exp
    screen
    
exports.Closure = class Closure extends Method
  Closure.__closure_id or= 0
  getID: -> @id or= "_closure_" + ++Closure.__closure_id
  children: -> ['params', 'block']
  
# Iterates through a string, yielding each character in the string.
# Example:
#
#     for ch in "hello"
#       ch   #=> 'h', 'e', 'l', 'l', 'o'
#
# Note that for iterating through a string list, you want ForOf instead.
exports.ForIn = class ForIn extends Base
  children: -> ['varid', 'expression', 'block']
  type: -> 'string'
  compile: (b) ->
    current_screen = b.root.current_screen().attrs.id
    
    @create(Require, "tsl/for_in").compile b
    closure = @create Closure, [@varid], @block
    closure.compile b.root
    
    b.root.goto current_screen
    (@create MethodCall, @create(Identifier, "for_in"), [@expression, @create(MethodReference, @create(Literal, closure.getID()))]).compile b
    

for i, klass of exports
  if klass.prototype instanceof Base
    klass.prototype.__name or= i
