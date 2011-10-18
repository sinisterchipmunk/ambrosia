{Document} = require '../nodes/document'
{Literal} = require '../nodes/literal'
{ViewTemplate} = require '../view_template'
xml = require('jsdom').jsdom

Document.preprocessor 'display',
  (builder, filename) ->
    template = ViewTemplate.find filename, @root().view_path || null
    
    if layout = @root().layout
      @root().current_template = template
      dom = xml layout.process this, builder
      @root().current_template = null
    else
      dom = xml template.process this, builder
    
    screen = builder.current_screen()

    traverse = (b) ->
      for node in b.attrs.dom.childNodes
        attrs = dom: node
        if node.attributes
          for attr in node.attributes
            name = attr.name
            value = attr.value
            attrs[name] = value
        if node.nodeName == '#text'
          attrs.value = node.nodeValue.trim()
          if attrs.value == "" then continue
        b.b node.nodeName.toLowerCase(), attrs, traverse
      delete b.attrs.dom
    
    screen.b 'display', dom: dom, traverse
    screen.extend()

    # what is there to return?
    @create Literal, ""
