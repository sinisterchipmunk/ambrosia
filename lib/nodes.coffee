TMLBuilder = require('./tml_builder').TMLBuilder
Scope = require('./variable_scope').VariableScope

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
    p = this
    while p
      return p.scope if p.scope
      p = p.parent
    throw new Error "BUG: No scope!"
    
  root: ->
    p = this
    while p
      parent = p
      p = p.parent
    parent
  
exports.Document = class Document extends Base
  after_initialize: ->
    @scope = new Scope
    @methods = {}
    @run_prepare_blocks()
  
  find_method: (name) ->
    method = @methods[name]
    throw new Error "No method named #{name}" if !method
    method
    
  children: -> ['block']
      
  compileDOM: ->
    builder = new TMLBuilder
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
  
  compile: (builder) -> @value.toString()

exports.Method = class Method extends Base
  children: -> ['inner', 'params', 'block']
  
  after_initialize: ->
    @next = "#__return__"
    if typeof(@inner) == 'string'
      @inner = compile: -> @inner
      
  getID: -> @id or= @inner.compile()
    
  tmltype: -> 'opaque'

  prepare: ->
    id = @getID()
    if id != 'main'
      @scope = @current_scope().sub id
    @root().methods[id] = this
    @current_scope().define 'return', null
    @current_scope().define param.compile(), null for param in @params
  
  compile: (builder) ->
    if id = @getID()
      screen = builder.screen id
    else
      throw new Error "Method needs a name"
    screen.attrs.next = @next
    @block.compile screen if @block

exports.MethodCall = class MethodCall extends Base
  children: -> ['method_name', 'params']
  tmltype: -> @_tmltype || 'integer'
  getMethodName: ->
    @_method_name or= @method_name.compile()
    
  compile: (screen) ->
    function_screen_id = @getMethodName()
    return_screen_id = "_#{screen.attrs['id']}_#{function_screen_id}"
    
    # console.log function_screen_id, screen.root.first('screen', id: function_screen_id)
    # @_tmltype = screen.root.first('screen', id: function_screen_id).tmltype()
    
    # create the call stack if it doesn't exist already
    screen.root.add_return_screen()
    # insert the destination _following_ the method call into the call stack
    screen.b 'setvar', name: 'call.stack', lo: ";", op: "plus", ro: "tmlvar:call.stack"
    screen.b 'setvar', name: 'call.stack', lo: "##{return_screen_id}", op: "plus", ro: "tmlvar:call.stack"
    # direct the current screen into the method screen
    screen.b 'next', uri: "##{function_screen_id}"

    method = @root().find_method function_screen_id
    throw new Error "Invalid parameter count: #{@params.length} for #{method.params.length}" if @params.length != method.params.length
    for i in [0...method.params.length]
      param_name = new Identifier method.params[i].compile(screen)
      param = @params[i]
      method.create(Assign, param_name, param).compile screen
    
    # create and return the return screen
    # subsequent ops will be performed transparently on the return screen
    screen.root.b 'screen', id: return_screen_id, next: "#__return__"
  
class Type extends Base
  tmltype: ->
    switch type = @type()
      when 'string', 'integer', 'opaque', 'datetime' then type
      when 'boolean', 'number' then 'integer'
      when 'screenref' then 'string'
      else throw new Error "untranslatable type: #{type}"
  
exports.Assign = class Assign extends Type
  type: -> @rvalue.type()
  
  children: -> ['lvalue', 'rvalue']
  
  compile: (screen) ->
    throw new Error "Can't use assignment as left value" if @lvalue instanceof Assign

    rval = @rvalue.compile screen
    if rval instanceof Assign
      rval = "tmlvar:"+@current_scope().lookup(rval.lvalue.compile screen).name
    else if @rvalue instanceof Identifier
      rval = "tmlvar:"+@current_scope().lookup(rval).name
    
    lval = @lvalue.compile screen
    type = @rvalue.tmltype()
    lval = @current_scope().define lval, type
    
    if @rvalue instanceof MethodCall
      screen.attrs.next = "##{rval.attrs.id}"
      screen = rval
      return_variable = @root().find_method(@rvalue.getMethodName()).current_scope().lookup("return").name
      rval = "tmlvar:#{return_variable}"

    if @rvalue instanceof Operation
      screen.b 'setvar', name: lval, lo: rval.lo, op: rval.op, ro: rval.ro
    else
      screen.b 'setvar', name: lval, lo: rval
    
    this # this is so assigns can chain assigns

exports.Operation = class Operation extends Type
  children: -> ['lvalue', 'operator', 'rvalue']
  
  type: -> @lvalue.type()
  
  compile: (screen) ->
    lo: @lvalue.compile(screen)
    ro: @rvalue.compile(screen)
    op: switch @operator
      when '+' then 'plus'
      when '-' then 'minus'
      else @operator
  
exports.Value = class Value extends Type
  children: -> ['_type', 'value']
  
  type: -> @_type
    
  compile: (builder) ->
    if typeof(@value) == 'string' then @value else @value.compile builder
    
exports.NumberValue = class NumberValue extends Value
  constructor: (v) ->
    v.value = parseInt v.value
    v.value = 0 if isNaN(v.value) or !isFinite(v.value)
    super('integer', v)
  
exports.StringValue = class StringValue extends Value
  constructor: (v) -> super('string', v)

exports.BoolValue = class BoolValue extends Value
  constructor: (v) -> super('boolean', (if v.toString().toLowerCase() == 'true' then 1 else 0))
  
exports.Identifier = class Identifier extends Value
  constructor: (v) -> super('string', v)
  compile: (builder) -> super
  
exports.ScreenReference = class ScreenReference extends Value
  constructor: (v) -> super('screenref', v)
  
  compile: (builder) ->
    "##{@value.compile builder}"

exports.Return = class Return extends Base
  children: -> ['expression']
    
  compile: (builder) ->
    screen_id = builder.attrs.id
    @create(Assign, new Identifier("return"), @expression).compile builder

for i, klass of exports
  if klass.prototype instanceof Base
    klass.prototype.__name or= i
