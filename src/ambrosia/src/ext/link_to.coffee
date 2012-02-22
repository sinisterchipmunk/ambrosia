{Document} = require 'nodes/document'
{Literal} = require 'nodes/literal'
{ViewTemplate} = require 'view_template'

Document.preprocessor 'link_to',
  (builder, caption, method_reference) ->
    "<a href=\"#{method_reference}\">#{caption}</a>"
