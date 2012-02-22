{Base} = require 'nodes/base'
create_dom = require('dom').create_dom

exports.EmbeddedTML = class EmbeddedTML extends Base
  # type: -> @rvalue.type()
  
  children: -> ['tml']
  # get_dependent_variable: -> @lvalue.get_dependent_variable()
  to_code: -> "`\n#{@tml}\n`"
  prepare: ->
  compile: (screen) ->
    # This code is largely reproduced in ../ext/display.coffee
    # TODO refactor to DRY
    dom = create_dom @tml
    screen = screen.root.current_screen()
    
    list = ""
    
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
    
    screen.attrs.dom_nodes = dom
    traverse screen
    
    ""
