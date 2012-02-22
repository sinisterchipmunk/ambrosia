{Extension} = require 'nodes/extension'
{Operation} = require 'nodes/operation'
{Range} = require 'nodes/range'

{Identifier} = require 'nodes/identifier'
{Assign} = require 'nodes/assign'
{Literal} = require 'nodes/literal'
{ForIn} = require 'nodes/for_in'
{Block} = require 'nodes/block'

exports.ListIndex = class ListIndex extends Extension
  type: -> 'string'
  
  children: -> ['list', 'index']
  
  to_code: ->
    if @index instanceof Range
      "#{@list.to_code()}[#{@index.to_code()}]"
    else
      "#{@list.to_code()}#{@index.to_code()}"
  
  compile: (b) ->
    if @index instanceof Range
      @require b, 'std/list_index'
      @invoke b, "list_index", @list, @index.start, @index.stop
    else
      @create(Operation, @list, 'item', @index).compile b
