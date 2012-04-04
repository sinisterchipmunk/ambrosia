{Parser, DefaultHandler} = require 'htmlparser'
{Builder} = require 'builder'

exports.create_dom = (code) ->
  handler = new DefaultHandler (error, dom) -> throw new Error(error) if error
  parser = new Parser handler
  parser.parseComplete code
  handler.dom
  
exports.traverse_and_build = (b, dom_nodes) ->
  for node in dom_nodes
    attrs = {}
    if node.attribs
      for name, value of node.attribs
        attrs[name] = value
    if node.type == 'text'
      node.name = '#text'
      attrs.value = node.data.trim()
      if attrs.value == "" then continue
      
    built_node = b.b node.name.toLowerCase(), attrs
    exports.traverse_and_build built_node, node.children || []

exports.build_dom_from = (code, builder = new Builder('__root__')) ->
  dom_nodes = exports.create_dom code
  exports.traverse_and_build builder, dom_nodes
  if builder.name == '__root__'
    builder.first('tml').make_root()
  else
    builder
