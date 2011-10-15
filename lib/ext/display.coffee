{Document} = require '../nodes/document'
{Literal} = require '../nodes/literal'
{ViewTemplate} = require '../view_template'
path = require 'path'
fs = require 'fs'
xml = require('jsdom').jsdom

Document.preprocessor 'display',
  (builder, filename) ->
    view_path = @root().view_path or process.env['AMBROSIA_VIEW_PATH'] or path.join process.cwd(), 'views'
    
    if filename[0] == /[//\\]/
      filepath = filename
    else
      filepath = path.join view_path, filename
    unless path.extname filepath
      filepath = "#{filepath}.xml"
    
    @views or= {}
    template = @views[filepath] or= new ViewTemplate fs.readFileSync filepath, 'UTF-8'
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

    # what is there to return?
    @create Literal, ""
