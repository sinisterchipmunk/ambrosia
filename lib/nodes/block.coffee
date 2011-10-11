{Base} = require './base'
{Document} = require './document'

exports.Block = class Block extends Base
  constructor: (nodes) -> super(nodes...)
  
  to_code: ->
    "  "+(node.to_code().split(/\n/).join("\n  ") for node in @nodes).join("\n  ")
    
  compile: (builder) ->
    @debug @to_code()
    
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
