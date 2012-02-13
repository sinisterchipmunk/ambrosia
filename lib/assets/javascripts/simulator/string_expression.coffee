{Expression} = require './expression'
{Format} = require './formatters'
  
Expression.register_type 'string', class StringExpression extends Expression
  evaluate: ->
    switch @op
      when 'plus' then @lvalue.toString() + @rvalue.toString()
      when 'minus'
        rval = parseInt(@rvalue)
        lval = @lvalue.toString()
        if rval.toString() != @rvalue.toString()
          throw new Error "Can only subtract numeric values from String"
          
        if rval > 0
          lval.substring(0, lval.length - rval)
        else
          lval.substring(-rval, lval.length)
      when 'item'
        # return Nth item from list
        rval = parseInt(@rvalue)
        lval = @lvalue.toString().split(';')
        
        if rval < 0 || rval >= lval.length
          ';'
        else
          lval[rval]
      when 'number'
        # return list item count
        if @lvalue.toString() == ""
          0
        else
          @lvalue.toString().split(';').length
      when 'format'
        new Format('string', @rvalue.toString(), @lvalue.toString()).process()
      else
        if @format
          new Format('string', @format, @lvalue.toString()).process()
        else
          if @op then throw new Error "Invalid string operation: #{@op}"
          else
            @lvalue.toString()
