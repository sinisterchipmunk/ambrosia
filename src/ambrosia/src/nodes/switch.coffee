{Extension} = require 'nodes/extension'
{Block} = require 'nodes/block'
{Identifier} = require 'nodes/identifier'
{Closure} = require 'nodes/closure'
{MethodCall} = require 'nodes/method_call'

exports.Switch = class Switch extends Extension
  to_code: ->
    header = "switch #{@expression.to_code()}\n"
    whens = ("  when #{(w.to_code() for w in _when[0]).join(', ')}\n#{@indent _when[1]}" for _when in @whens)
    _else = (if @else_block then "\n  else\n#{@indent @else_block}" else "")
    header + whens.join("\n") + _else
  children: -> ['expression', 'whens', 'else_block']
  type: -> @expression.type()
  
  prepare: ->
    {If} = require 'nodes/if'
    {Operation} = require 'nodes/operation'
    
    @actual_value = @create Identifier, 'switch.actual_value'
    @_if = _if = null
    @closures = []
    for _when in @whens
      # Switches can have multiple conditions to a given block, but the conditions
      # are replicated as individual variants each with their own result block,
      # so we create a closure here to prevent duplicating the block for each condition,
      # and then replace the block itself with a call to the closure. Results in a
      # vast reduction in TML.
      @closures.push closure = @create(Closure, [], _when[1])
      for condition in _when[0]
        invocation = @create Block, [@create MethodCall, @create(Identifier, closure.getID()), []]
        new_if = @create If, @create(Operation, @actual_value, '==', condition), invocation, 'if'
        if @_if
          _if.addElse @create Block, [new_if]
          _if = new_if
        else @_if = _if = new_if
    if @else_block
      _if.addElse @else_block
    
  compile: (b) ->
    @assign b, @actual_value, @expression
    current_screen = b.root.current_screen()
    closure.compile(b) for closure in @closures
    b.root.goto current_screen
    @_if.compile current_screen
