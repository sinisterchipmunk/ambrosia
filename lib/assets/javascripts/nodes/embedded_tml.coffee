{Base} = require './base'
xml = require('jsdom').jsdom

exports.EmbeddedTML = class EmbeddedTML extends Base
  # type: -> @rvalue.type()
  
  children: -> ['tml']
  # get_dependent_variable: -> @lvalue.get_dependent_variable()
  to_code: -> "`\n#{@tml}\n`"
  prepare: ->
  compile: (screen) ->
    # This code is largely reproduced in ../ext/display.coffee
    # TODO refactor to DRY
    dom = xml "<container>" + @tml + "</container>"
    screen = screen.root.current_screen()
    
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
    
    for node in dom.childNodes
      screen.attrs.dom = node
      traverse screen
      
    ""
