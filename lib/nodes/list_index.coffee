{Base} = require './base'
{Operation} = require './operation'

exports.ListIndex = class ListIndex extends Base
  type: -> 'string'
  
  children: -> ['list', 'index']
  
  to_code: -> "#{@list.to_code()}[#{@index.to_code()}]"
  
  compile: (screen) ->
    @create(Operation, @list, 'item', @index).compile screen
