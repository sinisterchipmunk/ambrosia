{Method} = require './method'

exports.Closure = class Closure extends Method
  Closure.__closure_id or= 0
  getID: -> @id or= "_closure_" + ++Closure.__closure_id
  children: -> ['params', 'block']
