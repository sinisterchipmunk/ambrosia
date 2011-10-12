{Extension} = require './extension'

# Iterates through a string, yielding each character in the string.
# Example:
#
#     for ch in "hello"
#       ch   #=> 'h', 'e', 'l', 'l', 'o'
#
# Note that for iterating through a string list, you want ForOf instead.
exports.ForIn = class ForIn extends Extension
  children: -> ['varid', 'expression', 'block']
  type: -> 'string'
  to_code: -> "for #{@varid.to_code()} in #{@expression.to_code()}\n#{@block.to_code()}"
  compile: (b) ->
    @require b, "std/for_in"
    @depend 'range', 'closure'

    current_screen = b.root.current_screen().attrs.id
    closure = @create Closure, [@varid], @block
    closure.compile b.root
    
    b.root.goto current_screen
    dest = "for_in"
    if @expression instanceof Range
      @invoke b, "for_in_range", @expression.start, @expression.stop, @expression.step, @method closure.getID()
    else
      @invoke b, "for_in", @expression, @method closure.getID()
