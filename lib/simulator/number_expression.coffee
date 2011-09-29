{Expression} = require './expression'

Expression.register_type 'integer', class NumberExpression extends Expression
  evaluate: ->
    if !@rvalue then return @lvalue
    switch @op
      when 'plus' then @lvalue + @rvalue
      when 'minus' then @lvalue - @rvalue
      else throw new Error "Invalid integer operation: #{@op}"
      
