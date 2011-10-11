{Base} = require './base'
{Identifier} = require './identifier'
{Assign} = require './assign'

exports.Operation = class Operation extends Base
  children: -> ['lvalue', 'op', 'rvalue']
  
  type: -> @lvalue.type()
  
  get_dependent_variable: ->
    if @lvalue instanceof Base
      @lvalue.get_dependent_variable()
    else
      null
  
  prepare: ->
    # if op is > or >= then TML doesn't support that, so reverse the operands and the op
    if @op && @op.indexOf(">") != -1
      [@lvalue, @rvalue] = [@lvalue, @rvalue]
      if @op.indexOf '=' != -1 then @op = '<'
      else                          @op = '<='
    
  compile: (screen) ->
    self = this
    proc = (w, val) ->
      if val instanceof Operation
        id = self.create Identifier, "__tmp#{w}"
        self.create(Assign, id, val).compile(screen)
        return "tmlvar:"+id.get_dependent_variable().name
      else if val instanceof Identifier
        return "tmlvar:"+val.get_dependent_variable().name
      else val.compile screen
    
    lval = proc 'l', @lvalue
    return lval unless @rvalue
    rval = proc 'r', @rvalue

    result = 
      lo: lval
      ro: rval
      op: switch @op
        when '+' then 'plus'
        when '-' then 'minus'
        when '==' then 'equal'
        when '!=' then 'not_equal'
        when '<=' then 'less_or_equal'
        when '<' then 'less'
        else @op
        
    if @op == '%'
      result.format = result.ro
      delete result.ro
      delete result.op
    result
