{Document} = require 'nodes/document'
{Literal} = require 'nodes/literal'
{ViewTemplate} = require 'view_template'
{Variable} = require 'variable_scope'

Document.preprocessor 'link_to',
  (builder, caption, method_reference) ->
    if method_reference instanceof Variable
      screen = builder.current_screen()
      builder.add_return_screen()
      builder.goto screen.attrs.id
      method_reference = "tmlvar:#{method_reference.name}"
    "<a href=\"#{method_reference}\">#{caption}</a>"
