{Base} = require './base'
{Operation} = require './operation'

exports.ListIndex = class ListIndex extends Base
  type: -> 'string'
  
  children: -> ['list', 'index']
  
  compile: (screen) ->
    @create(Operation, @list, 'item', @index).compile screen
