{TMLBuilder, NameRegistry} = require './tml_builder'
{VariableScope, Variable}  = require './variable_scope'

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
  
exports.Document = class Document extends Base
  after_initialize: ->
    @scope = new VariableScope
    @methods = {}
    @run_prepare_blocks()
  
  find_method: (name) ->
    method = @methods[name]
    throw new Error "No method named #{name}" if !method
    method
    
  children: -> ['block']
      
  compileDOM: ->
    builder = new TMLBuilder
    
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

# exports.Parens = class Parens extends Method
#   children: -> ['block']
#   getID: () -> @id or= "__tmp_method__"
#   prepare: ->
#     last = @block.nodes[@block.nodes.length-1]
#     if !(last instanceof Return)
#       @block.nodes[@block.nodes.length-1] = new Return(last)
#     super

exports.MethodCall = class MethodCall extends Base
  children: -> ['method_name', 'params']
  
  type: ->
    @root().find_method(@getMethodName()).type(@params)
    
  getMethodName: ->
    @_method_name or= @method_name.compile()
    
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

    if @rvalue instanceof Operation
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
  children: -> ['lvalue', 'operator', 'rvalue']
  
  type: -> @lvalue.type()
  
  compile: (screen) ->
    lval = @tml_variable @lvalue, screen
    return lval unless @rvalue
    rval = @tml_variable @rvalue, screen

    lo: lval
    ro: rval
    op: switch @operator
      when '+' then 'plus'
      when '-' then 'minus'
      else @operator
  
exports.Identifier = class Identifier extends Base
  type: -> @current_scope().lookup(@compile()).type()
  compile: (b) -> if typeof(@nodes[0]) == 'string' then @nodes[0] else @nodes[0].compile(b)
  
exports.ScreenReference = class ScreenReference extends Base
  children: -> ['value']
  type: -> "string"
  
  compile: (builder) ->
    "##{@value.compile builder}"

exports.Return = class Return extends Base
  children: -> ['expression']
  
  type: -> @expression.type()
    
  compile: (builder) ->
    screen_id = builder.attrs.id
    @create(Assign, new Identifier("return"), @expression).compile builder

for i, klass of exports
  if klass.prototype instanceof Base
    klass.prototype.__name or= i
