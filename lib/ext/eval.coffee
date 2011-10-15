{Document} = require '../nodes/document'
TML = require '../tml'

Document.preprocessor 'eval',
  (builder, code, namespace = null) ->
    if namespace == null
      subscope = @current_scope().sub 'eval'
    else
      if namespace[0] == '.' then subscope = @current_scope().root().sub namespace[1..-1]
      else subscope = @current_scope().sub namespace
      
    @root().__dependencies[namespace] = doc = TML.parse code
    doc.scope = subscope
    doc.run_prepare_blocks()
    doc.compile builder, false

    @create Literal, ""
