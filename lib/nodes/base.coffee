exports.Base = class Base
  debug: (mesg) ->
    console.log mesg if process.env['DEBUG']
  
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
    
  root: ->
    p = this
    while p
      parent = p
      p = p.parent
    parent
