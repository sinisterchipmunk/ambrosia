{Base} = require './base'
{Operation} = require './operation'

# Supported conditional variants include any combination of the following:
#
#     if i == 1
#       doSomething()
#     else if i == 2
#       whatever()
#     else
#       doSomethingElse()
#
#     if i == 1 then doSomething() else if i == 2 then whatever() else doSomethingElse()
#
#     if i == 1 then doSomething()
#     else if i == 2 then whatever()
#     else doSomethingElse()
#
#     doSomething() if i == 1
#     doSomething() unless i == 1
#
exports.If = class If extends Base
  to_code: -> "if #{@expression.to_code()}\n#{@block.to_code()}#{if @else_exp then "\nelse\n#{@else_exp.to_code()}" else ""}"
  
  # @if_type is either 'if' or 'unless'.
  children: -> ['expression', 'block', 'if_type']
  
  addElse: (block) ->
    @else_exp = block
    @else_exp.parent = this
    this
  
  compile: (builder) ->
    if @expression instanceof Operation
      op = @expression
    else
      if @expression.type() == 'integer'
        op = @create Operation, @expression, "not_equal", "0"
      else
        op = @create Operation, @expression, "not_equal", ""
  
    screen = builder.root.current_screen()
    screen = screen.branch op.compile screen
    @block.compile screen
    screen = @else_exp.compile screen.branch_else() if @else_exp
    screen
