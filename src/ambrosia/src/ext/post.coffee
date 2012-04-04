{Document} = require 'nodes/document'
{Literal} = require 'nodes/literal'
{ViewTemplate} = require 'view_template'

# Posts data to server. The last argument may be either a callback function, invoked
# when an error occurs, or a function reference, to be invoked when an error occurs.
#
# If omitted, the default error handler will simply throw a catastrophic error.
#
# Examples:
#    post '/path/to/post', payment.amount, card.pan
#    post '/path/to/post', payment.amount, card.pan, -> display 'Data post failed, please try again'
#    post '/path/to/post', payment.amount, card.pan, :error_function
#
Document.preprocessor 'post',
  (builder, path, variables...) ->
    if typeof(path) != 'string' then throw new Error "First argument must be a path to post data to"
    
    handler = variables[variables.length-1]
    if handler instanceof require('variable_scope').Variable
      handler = "#default_submit_error_handler"
      @import builder, 'std/default_submit_error_handler'
    else
      variables = variables[0...-1]
    
    screen = builder.root.current_screen().extend()
    screen.b 'submit', tgt: path, econn: handler, (b) =>
      for variable in variables
        b.b 'getvar', name: variable.name

    @create Literal, ""