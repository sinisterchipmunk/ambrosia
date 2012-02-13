{Expression} = require './expression'
{Format} = require './formatters'

Expression.register_type 'boolean', class BooleanExpression extends Expression
  evaluate: ->
    if @format
      @lvalue = new Format('string', @format.toString(), @lvalue.toString()).process()
      
    switch @op
      when 'equal'
        return @lvalue.toString() == @rvalue.toString()
      when 'not_equal'
        @op = 'equal'
        !@evaluate()
      when 'less'
        @rvalue = parseInt(@rvalue) - 1
        @op = 'less_or_equal'
        @evaluate()
      when 'less_or_equal'
        return parseInt(@lvalue) <= parseInt(@rvalue)
      when 'contains'
        return @lvalue.toString().indexOf(@rvalue.toString()) != -1
      else
        throw new Error "Invalid boolean operation: #{@op}"
