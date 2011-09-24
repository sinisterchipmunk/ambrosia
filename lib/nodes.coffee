builder = require './builder'

exports.Document = class Document
  constructor: (@block) ->
    @builder = new builder.Builder 'tml', xmlns: "http://www.ingenico.co.uk/tml", cache: "deny"
    @builder.b 'head', (b) ->
      b.b 'defaults', cancel: 'emb://embedded.tml'
    @build()
      
  build: ->
    @block.build @builder
      
  compile: ->
    @builder.toString()

exports.Block = class Block
  constructor: (@nodes = []) ->

  build: (builder) ->
    for node in @nodes
      node.build builder
  
  # Wrap up the given nodes as a **Block**, unless it already happens
  # to be one.
  @wrap: (nodes) ->
    return nodes[0] if nodes.length is 1 and nodes[0] instanceof Block
    new Block nodes

exports.Literal = class Literal
  constructor: (@value) ->
  
  build: -> @value
  
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
    lval = @lvalue.build(screen)
    rval = @rvalue.build(screen)
    
    screen.root.b 'vardcl', name: lval, type: @rvalue.tmltype() or "string"
    screen.b 'setvar', name: lval, lo: rval
    this # this is so assigns can chain assigns
    
exports.Screen = class Screen
  constructor: (@inner, @block) -> 
    
  build: (builder) ->
    if @inner.value
      screen = builder.b "screen", id: @inner.value
    else
      screen = builder.b "screen"
  
    if @block
      @block.build(screen)
  
exports.Value = class Value extends Type
  constructor: (@type, @value) -> 
    
  build: (builder) ->
    this
    
exports.NumberValue = class NumberValue extends Value
  constructor: (v) -> super('integer', parseInt v)
  
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
