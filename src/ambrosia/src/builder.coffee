TAB = "  "

Rules =
  screen: ['setvar', 'strtemplate', 'logrec', 'next', 'error', 'call_func', 'display', 'print', 'submit', 'tform']
  head: ['base', 'link', 'defaults', 'error']

exports.Builder = class Builder
  constructor: (@name, @attrs = {}, inner = null, depth = 0, @parent = null) ->
    throw new Error("name of root tag is required") unless @name
    @tags = []
    @depth = depth
    @root = (if @parent then @parent.root else this)
    @order = Rules[@name]
    
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
    @reorder @order... if @order
    child
    
  reorder: (expected...) ->
    sort = (a, b) =>
      [ai, bi] = [expected.indexOf(a.name), expected.indexOf(b.name)]
      if ai == -1 then throw new Error "child not listed for reorder: '#{a.name}' (parent: '#{@name}')"
      if bi == -1 then throw new Error "child not listed for reorder: '#{b.name}' (parent: '#{@name}')"
      if ai <= bi then [a, b]
      else [b, a]
      
    changed = true
    while changed
      changed_this_iter = false
      for i in [0...@tags.length]
        if i != @tags.length - 1
          sorted = sort(@tags[i], @tags[i+1])
          if sorted[0] != @tags[i]
            changed_this_iter = true
            [@tags[i], @tags[i+1]] = [sorted[0], sorted[1]]
      changed = changed_this_iter
    
  # ex:
  #    screen.insert 'next', before: 'display', after: 'setvar'
  #    screen.insert 'next', (-> ...), before: 'display', after: 'setvar'
  #    screen.insert 'next', {uri: '/'}, before: 'display', after: 'setvar'
  #    screen.insert 'next', {uri: '/'}, (-> ...), before: 'display', after: 'setvar'
  #
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
    
  search: (name, attrs = null) ->
    all = @all name, attrs
    for tag in @tags
      all = all.concat tag.search name, attrs
    all
    
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
    if @name == '#text' then return @tabs() + @attrs.value.split(/\n/).join("\n#{@tabs()}").trim()
    
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
