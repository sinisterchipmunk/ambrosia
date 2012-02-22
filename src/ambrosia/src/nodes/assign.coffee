{Base} = require 'nodes/base'
{Variable} = require 'variable_scope'
{Identifier} = require 'nodes/identifier'

exports.Assign = class Assign extends Base
  type: -> @rvalue.type()
  
  children: -> ['lvalue', 'rvalue']
  get_dependent_variable: -> @lvalue.get_dependent_variable()
  to_code: -> @lvalue.to_code() + " = " + @rvalue.to_code()
  prepare: ->
  compile: (screen) ->
    throw new Error "Can't use assignment as left value" if @lvalue instanceof Assign
    
    rval = @rvalue.compile screen.root.current_screen()
    screen = screen.root.current_screen()
    if screen.is_wait_screen()
      screen = screen.extend()

    type = @rvalue.type()
    dependent = @rvalue instanceof Identifier and @rvalue.get_dependent_variable()
    if dependent instanceof Variable and dependent.name.indexOf("__generic_method_param") == 0
      type = null
      
    if @lvalue.name[0..1] == '$.'
      $[@lvalue.name[2..-1]] = @rvalue.real()
    else
      lval = @current_scope().define @lvalue.name, type
    
      setvar = screen.b 'setvar', name: lval.name
      @lvalue.assign_value setvar, rval, type || 'string'

    lval
