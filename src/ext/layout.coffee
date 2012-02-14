{Document} = require 'nodes/document'
{Literal} = require 'nodes/literal'
{ViewTemplate} = require 'view_template'

Document.preprocessor 'layout',
  (builder, filename) ->
    @root().layout = ViewTemplate.find filename
    @create Literal, ""
    
Document.preprocessor "yield",
  (builder) ->
    if template = @root().current_template
      dom = template.process this, builder
      @create Literal, dom
    else
      return false
