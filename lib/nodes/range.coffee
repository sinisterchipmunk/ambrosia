{Base} = require './base'
{Literal} = require './literal'
{Operation} = require './operation'
{Parens} = require './parens'

exports.Range = class Range extends Base
  constructor: (@start, @stop, @inclusive = true) ->
    super()
    if !@inclusive
      @stop = @create Parens, @create Operation, @stop, "-", @create Literal, 1
  
  to_code: -> "[#{@start.to_code()}..#{@stop.to_code()}]"
  
  prepare: ->
    # console.log @start.type(), @stop.type()
    @step = @create Literal, 1
  
  type: -> 'integer' # whatever its form, a range is always numeric.
  
  compile: (b) ->
    