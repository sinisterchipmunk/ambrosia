{Method} = require 'nodes/method'

exports.Closure = class Closure extends Method
  Closure.__closure_id or= 0
  getID: -> @id or= "_closure_" + ++Closure.__closure_id
  children: -> ['params', 'block']
  to_code: -> "(#{(param.to_code for param in @params).join(', ')}) ->\n#{@block.to_code()}"
