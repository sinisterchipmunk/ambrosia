{Document} = require 'nodes/document'
{Literal} = require 'nodes/literal'
{ViewTemplate} = require 'view_template'

Document.preprocessor 'post',
  (builder, path, variables...) ->
    if typeof(path) != 'string' then throw new Error "First argument must be a path to post data to"
    screen = builder.root.current_screen().extend()
    screen.b 'submit', tgt: path, (b) =>
      for variable in variables
        b.b 'getvar', name: variable.name

    @create Literal, ""