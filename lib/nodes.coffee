TMLBuilder = require('./tml_builder').TMLBuilder

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
  children: -> []
  build: ->
  compile: -> throw new Error "no compiler for node"
  type: -> throw new Error "node has no type"
  root: ->
    p = this
    while p
      parent = p
      p = p.parent
    parent
  
# Documents (and all their nodes) are built in 2 phases. The first phase (build) processes nodes created
# by the developer (and/or code generated in rewriter.coffee) -- the actual program code --
# and creates a high-level document. The document contains information like variable names and types,
# method names, return types, and so forth.
#
# The second phase (compile) iterates through this high level document and creates the low-level
# TML code which corresponds to it.
exports.Document = class Document extends Base
  after_initialize: ->
    @methods = {}
    @variables = {}
    @build()
    
  children: -> ['block']
      
  build: ->
    @block.build()
    
  compileDOM: ->
    builder = new TMLBuilder
    
    for name, variable of @variables
      builder.vardcl name, variable.type, variable.value
      
    for name, method of @methods
      method.compile(builder)
      
    builder
      
  compile: ->
    @compileDOM().toString()

exports.Block = class Block extends Base
  constructor: (nodes) -> super(nodes...)
  
  build: ->
    for node in @nodes
      node.build()
  
  compile: (builder) ->
    for node in @nodes
      node.compile builder
      
  push: (node) ->
    @nodes.push node
  
  # Wrap up the given nodes as a **Block**, unless it already happens
  # to be one.
  @wrap: (nodes) ->
    return nodes[0] if nodes.length is 1 and nodes[0] instanceof Block
    new Block nodes

exports.Literal = class Literal extends Base
  children: -> ['value']
  
  build: -> @value.toString()
  
  compile: (builder) -> @value.toString()

exports.Method = class Method extends Base
  children: -> ['inner', 'params', 'block']
  
  after_initialize: ->
    @next = "#__return__"
    if typeof(@inner) == 'string'
      @inner = build: -> @inner

  getID: -> @id or= @inner.build()
    
  tmltype: -> 'opaque'

  build: ->
    @root().methods[@getID()] = this
    @block.build() if @block
  
  compile: (builder) ->
    if id = @getID()
      screen = builder.screen id
    else
      throw new Error "Method needs a name"
    screen.attrs.next = @next
    @block.compile(screen) if @block

exports.MethodCall = class MethodCall extends Base
  children: -> ['method_name', 'params']
  tmltype: -> @_tmltype || 'integer'
  getMethodName: ->
    @_method_name or= @method_name.build()
    
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
    # set up parameters and direct the current screen into the method screen
    screen.b 'next', uri: "##{function_screen_id}"
    
    # create and return the return screen
    # subsequent ops will be performed transparently on the return screen
    screen.root.b 'screen', id: return_screen_id, next: "#__return__"
  
class Type extends Base
  tmltype: ->
    switch @type
      when 'string', 'integer', 'opaque', 'datetime' then @type
      when 'boolean' then 'integer'
      when 'screenref' then 'string'
      else throw new Error "untranslatable type: #{@type}"
  
exports.Assign = class Assign extends Type
  after_initialize: -> @type = @rvalue.type
  
  children: -> ['lvalue', 'rvalue']
  
  compile: (screen) ->
    lval = @lvalue.compile screen
    rval = @rvalue.compile screen
    
    throw new Error "Can't use assignment as left value" if lval instanceof Assign
    if rval instanceof Assign
      rval = "tmlvar:#{rval.lvalue.compile(screen)}"
      
    if @rvalue instanceof Identifier
      # a local variable name or a screen name.
      # If it's a screen name then it's not by reference, and should be treated as
      # a method call.
      for scrid, scr of @root().methods
        if rval == scrid # method call
          @rvalue = new MethodCall(new Literal(rval), [])
          rval = @rvalue.compile screen
          break
    
    screen.root.vardcl lval, @rvalue.tmltype() || "string"
    
    if @rvalue instanceof MethodCall
      screen.attrs.next = "##{rval.attrs.id}"
      screen = rval
      rval = "tmlvar:#{@rvalue.getMethodName()}.return"

    screen.b 'setvar', name: lval, lo: rval
    
    this # this is so assigns can chain assigns
  
exports.Value = class Value extends Type
  children: -> ['type', 'value']
    
  compile: (builder) ->
    @value.compile(builder)
    
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
  # for now treat as string
  constructor: (v) -> super('string', v)
  
exports.ScreenReference = class ScreenReference extends Value
  constructor: (v) -> super('screenref', v)
  
  compile: (builder) ->
    "##{@value.compile(builder)}"

exports.Return = class Return extends Base
  children: -> ['expression']
    
  compile: (builder) ->
    screen_id = builder.attrs.id
    new Assign(new Literal("#{screen_id}.return"), @expression).compile(builder)
