{Document} = require 'nodes/document'
{Literal} = require 'nodes/literal'
{Assign} = require 'nodes/assign'
{ViewTemplate} = require 'view_template'
create_dom = require('dom').create_dom

Document.preprocessor 'display',
  (builder, filenames...) ->
    for filename in filenames
      template = ViewTemplate.find filename
    
      if layout = @root().layout
        @root().current_template = template
        dom = create_dom layout.process this, builder
        @root().current_template = null
      else
        dom = create_dom template.process this, builder
        
      screen = builder.current_screen()
      if screen.is_wait_screen()
        screen = screen.extend()

      traverse = (b) ->
        for node in b.attrs.dom_nodes
          attrs = dom_nodes: node.childNodes
          if node.attributes
            for attr in node.attributes
              name = attr.name
              value = attr.value
              attrs[name] = value
          if node.nodeName == '#text'
            attrs.value = node.nodeValue.trim()
            if attrs.value == "" then continue
          b.b node.nodeName.toLowerCase(), attrs, traverse
        delete b.attrs.dom_nodes
    
      screen.b 'display', dom_nodes: dom, traverse

    # what is there to return?
    @create Literal, ""
