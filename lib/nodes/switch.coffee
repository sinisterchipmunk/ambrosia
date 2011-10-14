{Extension} = require './extension'
{Block} = require './block'

exports.Switch = class Switch extends Extension
  to_code: ->
    header = "switch #{@expression.to_code()}\n"
    whens = ("  when #{_when[0].to_code()}\n#{@indent _when[1]}" for _when in @whens)
    _else = (if @else_block then "\n  else\n#{@indent @else_block}" else "")
    header + whens.join("\n") + _else
  children: -> ['expression', 'whens', 'else_block']
  type: -> @expression.type()
  
  prepare: ->
    @depend 'if', 'operation'
    @_if = _if = null
    for _when in @whens
      new_if = @create If, @create(Operation, @expression, '==', _when[0]), _when[1], 'if'
      if @_if
        _if.addElse @create Block, [new_if]
        _if = new_if
      else @_if = _if = new_if
    if @else_block
      _if.addElse @else_block
    
  compile: (b) ->
    @_if.compile b
