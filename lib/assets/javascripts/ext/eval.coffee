{Document} = require '../nodes/document'
{MethodCall} = require '../nodes/method_call'
{Return} = require '../nodes/return'
TML = require '../tml'

eval_id = 0
Document.preprocessor 'eval',
  (builder, code, namespace = null) ->
    if namespace == null
      subscope = @current_scope().sub 'eval'
    else
      if namespace[0] == '.' then subscope = @current_scope().root().sub namespace[1..-1]
      else subscope = @current_scope().sub namespace
      
    entry_name = '__eval_'+eval_id++
    block = TML.parse(code).block
    main = null
    for node in block.nodes
      if node.getID and node.getID() == '__main__'
        node.id = entry_name
        main = node
        
    throw new Error "couldn't find main" unless main # this shouldn't actually happen
    block = main.block
    block.parent = this
    block.scope = subscope
    block.run_prepare_blocks()
    block
