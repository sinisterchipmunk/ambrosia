{Document} = require '../nodes/document'
TML = require '../tml'

eval_id = 0
Document.preprocessor 'eval',
  (builder, code, namespace = null) ->
    if namespace == null
      subscope = @current_scope().sub 'eval'
    else
      if namespace[0] == '.' then subscope = @current_scope().root().sub namespace[1..-1]
      else subscope = @current_scope().sub namespace
      
    block = TML.parse(code).block
    for node in block.nodes
      if node.getID and node.getID() == '__main__'
        node.id = '__eval_'+eval_id++
    block.parent = this
    block.scope = subscope
    block.run_prepare_blocks()
    block
