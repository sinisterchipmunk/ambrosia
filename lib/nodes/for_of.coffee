{Extension} = require './extension'

# Iterates through items in a string list, yielding each item in the list.
# Example:
#
#     for ch of "one;two;three"
#       ch   #=> 'one', 'two', 'three'
#
# Note that for iterating through characters in a string, you want ForIn instead.
exports.ForOf = class ForOf extends Extension
  children: -> ['varid', 'expression', 'block']
  type: -> 'string'
  to_code: -> "for #{@varid.to_code()} of #{@expression.to_code()}\n#{@block.to_code()}"
  compile: (b) ->
    @require b, 'std/for_of'
    @depend 'closure'

    current_screen = b.root.current_screen().attrs.id
    closure = @create Closure, [@varid], @block
    closure.compile b.root
    
    b.root.goto current_screen
    
    @invoke b, "for_of", @expression, @method closure.getID()
