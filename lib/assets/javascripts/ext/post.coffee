{Document} = require '../nodes/document'
{Literal} = require '../nodes/literal'
{ViewTemplate} = require '../view_template'
xml = require('jsdom').jsdom

Document.preprocessor 'post',
  (builder, path, variables...) ->
    screen = builder.root.current_screen()
    screen.b 'submit', tgt: path, (b) =>
      for variable in variables
        b.b 'getvar', name: variable.name

    @create Literal, ""