TMLBuilder = require('./tml_builder').TMLBuilder  

exports.Document = class Document
  constructor: (@block) ->
    @builder = new TMLBuilder
    @build()
      
  build: ->
    @builder.screens = []
    @block.build @builder
      
  compile: ->
    @builder.toString()

exports.Block = class Block
  constructor: (@nodes = []) ->

  build: (builder) ->
    # first, collect the `Method`s so we can do things like function calls by screen name
    for node in @nodes
      if node instanceof Method
        builder.root.screens.push node
    
    # now, build the block
    for node in @nodes
      node.build builder
      
  push: (node) ->
    @nodes.push node
  
  # Wrap up the given nodes as a **Block**, unless it already happens
  # to be one.
  @wrap: (nodes) ->
    return nodes[0] if nodes.length is 1 and nodes[0] instanceof Block
    new Block nodes

exports.Literal = class Literal
  constructor: (@value) ->
  
  build: (builder) ->
    @value.toString()

exports.Method = class Method
  constructor: (@inner, @block) ->
    if typeof(@inner) == 'string'
      @inner = { build: -> @inner }

  getID: (builder) ->
    @id or= @inner.build(builder)
    
  tmltype: -> 'opaque'

  build: (builder) ->
    if id = @getID(builder)
      screen = builder.screen id
    else
      throw new Error "Method needs a name"

    screen.attrs.next or= "#__return__"

    if @block
      @block.build(screen)

exports.MethodCall = class MethodCall
  constructor: (@method_name, @params) ->
    
  tmltype: -> @_tmltype || 'integer'
  
  getMethodName: (screen) ->
    @_method_name or= @method_name.build(screen)
    
  build: (screen) ->
    function_screen_id = @getMethodName(screen)
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
  
class Type
  tmltype: ->
    switch @type
      when 'string', 'integer', 'opaque', 'datetime' then @type
      when 'boolean' then 'integer'
      when 'screenref' then 'string'
      else throw new Error "untranslatable type: #{@type}"
  
exports.Assign = class Assign extends Type
  constructor: (@lvalue, @rvalue) ->
    @type = @rvalue.type
  
  build: (screen) ->
    lval = @lvalue.build screen
    rval = @rvalue.build screen
    
    throw new Error "Can't use assignment as left value" if lval instanceof Assign
    if rval instanceof Assign
      rval = "tmlvar:#{rval.lvalue.build(screen)}"
      
    if @rvalue instanceof Identifier
      # a local variable name or a screen name.
      # If it's a screen name then it's not by reference, and should be treated as
      # a method call.
      for scr in screen.root.screens
        if rval == scr.getID() # method call
          @rvalue = new MethodCall(new Literal(rval), [])
          rval = @rvalue.build screen
          break
    
    screen.root.vardcl lval, @rvalue.tmltype() || "string"
    
    # if rval instanceof Builder
    if @rvalue instanceof MethodCall
      screen.attrs.next = "##{rval.attrs.id}"
      screen = rval
      rval = "tmlvar:#{@rvalue.getMethodName()}.return"

    screen.b 'setvar', name: lval, lo: rval
    
    this # this is so assigns can chain assigns
  
exports.Value = class Value extends Type
  constructor: (@type, @value) -> 
    
  build: (builder) ->
    @value.build(builder)
    
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
  
  build: (builder) ->
    "##{@value.build(builder)}"

exports.Return = class Return
  constructor: (@expression) ->
    
  build: (builder) ->
    screen_id = builder.attrs.id
    new Assign(new Literal("#{screen_id}.return"), @expression).build(builder)
