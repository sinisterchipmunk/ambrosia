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
  to_code: -> "if #{@expression.to_code()}\n#{@block.to_code()}#{if @else_block then "\nelse\n#{@else_block.to_code()}" else ""}"
  
  # @if_type is either 'if' or 'unless'.
  children: -> ['expression', 'block', 'if_type']
  
  type: -> @block.type() || @else_block.type()
  
  addElse: (block) ->
    @else_block = block
    @else_block.parent = this
    this
  
  compile: (builder) ->
    if @expression instanceof Operation
      op = @expression
    else
      if @expression.type() == 'integer'
        op = @create Operation, @expression, "not_equal", "0"
      else
        op = @create Operation, @expression, "not_equal", ""
  
    screen = if_screen = builder.root.current_screen()
    screen = screen.branch op.compile screen
    @block.compile screen
    if @else_block
      if @else_block.nodes.length == 1 and @else_block.nodes[0] instanceof If
        # else if ...
        builder.root.goto if_screen.attrs.id
        @else_block.compile if_screen
      else
        # else ...
        screen = screen.branch_else()
        @else_block.compile screen
    screen.branch_merge()
    