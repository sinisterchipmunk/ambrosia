{Base} = require 'nodes/base'
{Document} = require 'nodes/document'
{Return} = require 'nodes/return'

exports.Block = class Block extends Base
  constructor: (nodes) ->
    super(nodes...)
  
  to_code: ->
    "  "+(node.to_code().split(/\n/).join("\n  ") for node in @nodes).join("\n  ")
    
  type: -> @nodes[@nodes.length-1].type()
  
  compile: (builder) ->
    @debug "> " + @to_code().split(/\n/).join("\n> ")
    
    last_result = null
    for node in @nodes
      last_result = node.compile builder
    last_result
      
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
