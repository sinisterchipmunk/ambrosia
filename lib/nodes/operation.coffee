{Base} = require './base'
{Identifier} = require './identifier'
{Assign} = require './assign'
{Variable} = require "../variable_scope"

exports.Operation = class Operation extends Base
  children: -> ['lvalue', 'op', 'rvalue']
  
  type: ->
    # special case: __method_params is just a container for real params.
    # don't let its (string) type propogate.
    #
    # TODO see if this should hold true for all list types -- and see
    # if there's anything that can be done about user-defined
    # lists (since they're just strings anyways).
    if @lvalue instanceof Identifier and @lvalue.name == ".__method_params"
      return null
      
    @lvalue.type() || @rvalue.type()
  
  to_code: ->
    if @rvalue
      "#{@lvalue.to_code()} #{@op} #{@rvalue.to_code()}"
    else
      @lvalue.to_code()
  
  get_dependent_variable: ->
    if @lvalue instanceof Base
      @lvalue.get_dependent_variable()
    else if @lvalue instanceof Variable
      @lvalue
    else
      null
  
  prepare: ->
    # if op is > or >= then TML doesn't support that, so reverse the operands and the op
    if @op && @op.indexOf(">") != -1
      [@lvalue, @rvalue] = [@rvalue, @lvalue]
      if @op.indexOf '=' != -1 then @op = '<='
      else                          @op = '<'
    
  compile: (screen) ->
    self = this
    proc = (w, val) ->
      if val instanceof Operation
        id = self.create Identifier, "__tmp#{w}"
        self.create(Assign, id, val).compile(screen)
        return "tmlvar:"+id.get_dependent_variable().name
      else if val instanceof Identifier
        return "tmlvar:"+val.get_dependent_variable().name
      else if val instanceof Variable
        return "tmlvar:"+val.name
      else
        _v = val.compile screen
        if _v instanceof Variable then "tmlvar:#{_v.name}"
        else _v
    
    lval = proc 'l', @lvalue
    return lval unless @rvalue
    rval = proc 'r', @rvalue

    depth = @depth()
    result_variable = @current_scope().define ".tmp.#{@type()}.op#{depth}", @type()

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

    if result.op and result.op in ['equal', 'not_equal', 'less', 'less_or_equal']
      return result
    
    setvar = screen.root.current_screen().b 'setvar', name: result_variable.name
    @create(Identifier, result_variable.name).assign_value setvar, result
    result_variable
