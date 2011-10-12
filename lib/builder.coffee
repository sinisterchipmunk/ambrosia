TAB = "  "

exports.Builder = class Builder
  constructor: (@name, @attrs = {}, inner = null, depth = 0, @parent = null) ->
    throw new Error("name of root tag is required") unless @name
    @tags = []
    @depth = depth
    @root = (if @parent then @parent.root else this)
    
    # possibly a callback was given but attrs was omitted; correct as necessary.
    if !inner && @attrs instanceof Function
      inner = @attrs
      @attrs = {}
      
    @after_initialize() if @after_initialize
    
    inner(this) if inner
  
  remove: (node_or_name, attrs = {}) ->
    if typeof(node_or_name) == 'object'
      attrs = node_or_name.attrs
      node_or_name = node_or_name.name
      
    for i in [0...@tags.length]
      if @matches(@tags[i], node_or_name, attrs)
        @tags.splice i, 1
        @remove node_or_name, attrs
        break
        
  preamble: -> '<?xml version="1.0" encoding="ISO-8859-1"?>\n'
  
  newInstance: (name, attrs, inner) ->
    klass = (if Builder[name] then Builder[name] else Builder)
    new klass name, attrs, inner, @depth + 1, this
    
  b: (name, attrs, inner) ->
    child = @newInstance(name, attrs, inner)
    @tags.push(child)
    child
    
  insert: (name, attrs, inner, sort) ->
    if attrs && !sort
      if attrs.before || attrs.after
        sort = attrs
        attrs = {}
    if typeof(inner) == 'object' && !sort
      sort = inner
      inner = null
      
    child = @newInstance(name, attrs, inner)
    if sort.before
      if (index = @tags.indexOf @first(sort.before)) != -1
        @tags.splice index, 0, child
        return child
    if sort.after
      if (index = @tags.indexOf @last(sort.after)) != -1
        @tags.splice index+1, 0, child
        return child
    @tags.push child
    child
    
  first: (name, attrs = null) -> @all(name, attrs)[0]
    
  last: (name, attrs = null) -> all = @all(name, attrs); all[all.length-1]
    
  all: (name, attrs = null) ->
    result = []
    for tag in @tags
      if @matches(tag, name, attrs)
        result.push tag
    result
    
  matches: (tag, name, attrs) ->
    if !name || tag.name.toLowerCase() == name.toLowerCase()
      if attrs
        match = true
        for k, v of attrs
          if tag.attrs[k] != v
            match = false
            break
        return true if match
      else
        return true
    false
    
  stringify: ->
    front = "<#{@name} "
    front += "#{k}=\"#{v}\" " for k, v of @attrs
    if @tags.length > 0
      @tabs() + front.trim() + ">\n" +
        (tag.toString(false) + "\n" for tag in @tags).join("") +
      @tabs() + "</#{@name}>"
    else
      @tabs() + front + "/>"
      
  tabs: (depth = @depth) ->
    result = ""
    for i in [0...depth]
      result += TAB
    result
  
  toString: (preamble = true) ->
    (if preamble then @preamble() else "") + @stringify()
