{Document} = require 'nodes/document'
{Literal} = require 'nodes/literal'

Document.preprocessor 'check_card',
  (builder) ->
    screen = builder.root.current_screen().extend()
    screen.b 'tform', (tform) ->
      tform.b 'card', parser: 'mag', parser_params: 'risk_mgmt'
    @create Literal, ""
