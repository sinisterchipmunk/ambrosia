{TMLBuilder, NameRegistry} = require './tml_builder'
{VariableScope, Variable}  = require './variable_scope'
TML = require './tml'
path = require 'path'
fs = require 'fs'

exports.Base = class Base
  constructor: (@nodes...) ->
    nodes = @nodes
    self = this
    children = @children()
    for index in [0...nodes.length]
      node = nodes[index]
      node.parent = self
      if children
        self[children[index]] = node
    @after_initialize() if @after_initialize
  
  create: (klass, args...) ->
    child = new klass args...
    child.parent = this
    # need to do this right away since child is created after parent already exists
    child.run_prepare_blocks()
    child
    
  run_prepare_blocks: ->
    @prepare() if @prepare
    for node in @nodes
      node.run_prepare_blocks() if node instanceof Base
  
  children: -> []
  
  compile: -> throw new Error "no compiler for node"
  
  type: -> throw new Error "node has no type"
  
  current_scope: ->
    return @scope if @scope
    return @parent.current_scope() if @parent
    throw new Error "BUG: No scope!"
    
  # if the reference is the name of a TML variable, the reference tag "tmlvar:" is prepended
  # to the return value.
  tml_variable: (field, builder) ->
    val = field.compile builder
    if field instanceof Identifier
      val = "tmlvar:#{@current_scope().lookup(val).name}"
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
    @root().__dependencies or= {}
    @namespace = @path
    @namespace = @namespace.replace match[0], '.' while match = /[\/\\]/.exec @namespace
    @path = @path + ".tsl" if path.extname(@path) == ""
    @path = path.join(__dirname, @path) unless @path[0] == '/' or @path[0] == '\\'

    return if @root().__dependencies[@path]
    @code = fs.readFileSync @path, 'UTF-8'
    @doc = TML.parse @code
    
  compile: (builder) ->
    return if @root().__dependencies[@path]
    # link our scope into dep's scope so that dep can reference its own variables
    # @doc.scope = @current_scope().sub @namespace
    
    # HACK
    @doc.scope._prefix = @namespace+"."
    @doc.scope.parent = @current_scope()
    @current_scope().subscopes[@namespace] = @doc.scope
    @current_scope().recalculate()
    
    @doc.compileDOM builder
    @root().__dependencies[@path] = @doc
  
exports.Document = class Document extends Base
  after_initialize: ->
    @scope = new VariableScope
    @methods = {}
    @run_prepare_blocks()
  
  find_method: (name) ->
    return @methods[name] if @methods[name]
    if @__dependencies
      for dep, doc of @__dependencies
        return doc.methods[name] if doc.methods[name]
    throw new Error "No method named #{name}"
    
  children: -> ['block']
      
  compileDOM: (builder = new TMLBuilder) ->
    # builder = new TMLBuilder
    
    # if @methods['__main__']
    #   @methods['__main__'].compile builder
    # else
    #   throw new Error 'No main program to compile!'
      
    for name, method of @methods
      method.compile builder
    
    # important to compile scopes last, because method nodes are still building them until now
    @current_scope().compile builder
    
    builder
      
  compile: ->
    @compileDOM().toString()

exports.Block = class Block extends Base
  constructor: (nodes) -> super(nodes...)
  
  compile: (builder) ->
    for node in @nodes
      node.compile builder
      
  push: (node) ->
    node.parent = this
    @nodes.push node
    node.run_prepare_blocks()
  
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
  
  compile: (builder) ->
    @value.toString()

exports.Method = class Method extends Base
  children: -> ['name', 'params', 'block']
  
  after_initialize: ->
    @params or= []
    @next = "#__return__"
    if typeof(@name) == 'string'
      @name = compile: -> @name
      
  getID: ->
    @id or= @name.compile()
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
    @current_scope().define("return")

  prepare: ->
    id = @getID()
    throw new Error "Duplicate method: #{id}" if @root().methods[id]
    @root().methods[id] = this
    @current_scope().define param.compile(), null for param in @params
  
  compile: (builder) ->
    screen = builder.root.screen @getID()
    screen.attrs.next = @next
    @block.compile screen if @block

exports.MethodCall = class MethodCall extends Base
  children: -> ['method_name', 'params']
  
  type: ->
    @root().find_method(@getMethodName()).type(@params)
    
  getMethodName: ->
    @_method_name or= @method_name.compile()
    
  prepare: ->
    # if it's a precompile method, wipe out this instance's compile method so it can do
    # no harm. TODO make this more flexible.
    if @getMethodName() == 'require'
      @require = @create Require, (param.compile() for param in @params)...
      @compile = (screen) -> @require.compile screen.root
    
  compile: (screen) ->
    function_screen_id = @getMethodName()
    return_screen_id = "#{screen.attrs['id']}_#{NameRegistry.register function_screen_id}"
    
    method = @root().find_method function_screen_id
    throw new Error "Invalid parameter count: #{@params.length} for #{method.params.length}" if @params.length != method.params.length
    for i in [0...method.params.length]
      param_name = new Identifier method.params[i].compile(screen)
      param = @params[i]
      # evaluate param variables in *current* scope, not in method's scope
      if param instanceof Identifier
        # use variable's fully qualified name to avoid scoping issues in method
        param = new Identifier @current_scope().lookup(param.compile(screen)).name
      method.create(Assign, param_name, param).compile screen
    
    screen.root.current_screen().call_method function_screen_id, return_screen_id

    # create and return the return screen
    # subsequent ops will be performed transparently on the return screen
    screen.root.screen return_screen_id
  
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
    # screen = screen.root.current_screen()
    @create(Operation, @list, 'item', @index).compile screen

exports.Assign = class Assign extends Base
  type: -> @rvalue.type()
  
  children: -> ['lvalue', 'rvalue']
  
  compile: (screen) ->
    screen = screen.root.current_screen()
    throw new Error "Can't use assignment as left value" if @lvalue instanceof Assign

    rval = @rvalue.compile screen
    if rval instanceof Assign
      rval = @current_scope().lookup(rval.lvalue.compile screen)
    else if @rvalue instanceof Identifier
      rval = @current_scope().lookup rval
    
    lval = @lvalue.compile screen
    type = @rvalue.type()
    lval = @current_scope().define(lval, type).name
    
    if @rvalue instanceof MethodCall
      screen.attrs.next = "##{rval.attrs.id}"
      screen = rval
      rval = @root().find_method(@rvalue.getMethodName()).getReturnVariable()

    if typeof(rval) == 'object' and rval.lo
      screen.b 'setvar', name: lval, lo: rval.lo, op: rval.op, ro: rval.ro
    else
      if typeof(rval) == "object" and rval instanceof Variable
        @current_scope().lookup(lval).depends_upon rval
        rval = "tmlvar:#{rval.name}"
      else
        @current_scope().define lval, @rvalue.type()
      screen.b 'setvar', name: lval, lo: rval
    
    this # this is so assigns can chain assigns

exports.Operation = class Operation extends Base
  children: -> ['lvalue', 'op', 'rvalue']
  
  type: -> @lvalue.type()
  
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
  
exports.Identifier = class Identifier extends Base
  type: -> @current_scope().lookup(@compile()).type()
  compile: (b) -> if typeof(@nodes[0]) == 'string' then @nodes[0] else @nodes[0].compile(b)
  
exports.MethodReference = class MethodReference extends Base
  children: -> ['value']
  type: -> "string"
  
  compile: (builder) ->
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
    @create(Assign, new Identifier("return"), @expression || new Literal "").compile builder

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
    @create(Require, "tsl/for_in").compile b
    

for i, klass of exports
  if klass.prototype instanceof Base
    klass.prototype.__name or= i
