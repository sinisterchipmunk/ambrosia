{Extension} = require './extension'
{Operation} = require './operation'
{Range} = require './range'

{Identifier} = require './identifier'
{Assign} = require './assign'
{Literal} = require './literal'
{ForIn} = require './for_in'
{Block} = require './block'

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
