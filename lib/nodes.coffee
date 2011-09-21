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
  
exports.Assign = class Assign
  constructor: (@lvalue, @rvalue) ->
    
  build: (screen) ->
    screen.root.b 'vardcl', name: @lvalue.value, type: @rvalue.tmltype() or "string"
    screen.b 'setvar', name: @lvalue.value, lo: @rvalue.value
    
exports.Screen = class Screen
  constructor: (@inner, @block) -> 
    
  build: (builder) ->
    if @inner.value
      screen = builder.b "screen", id: @inner.value
    else
      screen = builder.b "screen"

    if @block
      @block.build(screen)
  
exports.Value = class Value
  constructor: (@type, @value) -> 
    
  tmltype: ->
    switch @type
      when 'string', 'integer', 'opaque', 'datetime' then @type
      when 'boolean' then 'integer'
      else throw new Error "untranslatable type: #{@type}"
    
  build: (builder) ->
    @value
    
exports.NumberValue = class NumberValue extends Value
  constructor: (v) -> super('integer', parseInt v)
  
exports.StringValue = class StringValue extends Value
  constructor: (v) -> super('string', v)

exports.BoolValue = class BoolValue extends Value
  constructor: (v) -> super('boolean', (if v.toString().toLowerCase() == 'true' then 1 else 0))
  
exports.Identifier = class Identifier extends Value
  # for now treat as string
  constructor: (v) -> super('string', v)
  