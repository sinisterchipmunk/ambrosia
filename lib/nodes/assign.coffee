{Base} = require './base'
{Variable} = require '../variable_scope'

exports.Assign = class Assign extends Base
  type: -> @rvalue.type()
  
  children: -> ['lvalue', 'rvalue']
  
  to_code: -> @lvalue.to_code() + " = " + @rvalue.to_code()
  prepare: ->
  compile: (screen) ->
    throw new Error "Can't use assignment as left value" if @lvalue instanceof Assign
      
    rval = @rvalue.compile screen.root.current_screen()
    screen = screen.root.current_screen()

    type = @rvalue.type()
    lval = @current_scope().define @lvalue.name, type
    
    setvar = screen.b 'setvar', name: lval.name
    @lvalue.assign_value setvar, rval, type || 'string'

    lval
