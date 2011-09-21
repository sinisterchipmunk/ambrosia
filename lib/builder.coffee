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
      
    inner(this) if inner
  
  preamble: -> '<?xml version="1.0" encoding="ISO-8859-1"?>\n'
  
  b: (name, attrs, inner) ->
    child = new Builder name, attrs, inner, @depth + 1, this
    @tags.push(child)
    child
    
  first: (name, attrs = null) ->
    for tag in @tags
      if tag.name.toLowerCase() == name.toLowerCase()
        if attrs
          for k, v of attrs
            if tag.attrs[k] == v
              return tag
        else
          return tag
    null
    
  stringify: ->
    front = "<#{@name} "
    front += "#{k}=\"#{v}\" " for k, v of @attrs
    if @tags.length > 0
      @tabs() + front.trim() + ">\n" +
        (tag.toString(false) + "\n" for tag in @tags) +
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
