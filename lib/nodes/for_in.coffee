{Base} = require './base'
{MethodCall} = require './method_call'
{MethodReference} = require './method_reference'
{Literal} = require './literal'
{Require} = require './require'
{Closure} = require './closure'
{Identifier} = require './identifier'

# Iterates through a string, yielding each character in the string.
# Example:
#
#     for ch in "hello"
#       ch   #=> 'h', 'e', 'l', 'l', 'o'
#
# Note that for iterating through a string list, you want ForOf instead.
exports.ForIn = class ForIn extends Base
  children: -> ['varid', 'expression', 'block']
  type: -> 'string'
  compile: (b) ->
    current_screen = b.root.current_screen().attrs.id
    
    @create(Require, "std/for_in").compile b
    closure = @create Closure, [@varid], @block
    closure.compile b.root
    
    b.root.goto current_screen
    (@create MethodCall, @create(Identifier, "for_in"), [@expression, @create(MethodReference, @create(Literal, closure.getID()))]).compile b
