{ Literalize } = require './common'

exports.Expression = class Expression
  constructor: (@variable_state, expr) ->
    @format = expr.format
    @op = expr.op
    @lvalue = Literalize(@variable_state, expr.lo, @type)
    if expr.ro != undefined and expr.ro != ''
      @rvalue = Literalize(@variable_state, expr.ro, @type)
    else @rvalue = expr.ro
  
  evaluate: -> throw new Error "Override Expression#evaluate returning result"
  
  # Usages:
  #
  #   Expression.evaluate "integer", { lo: 1, ro: 2, op: 'plus' }
  #     => 3
  #   Expression.evaluate "integer", { lo: "tmlvar:a", ro:2, op:'plus' }, { a: { value: 10, type: 'integer' } }
  #     => 12
  #
  @evaluate: (type, expr, variable_state = {}) ->
    if Expression.types[type]
      new Expression.types[type](variable_state, expr).evaluate()
    else
      throw new Error "No expression candidate for type #{type}"
  
  @register_type: (type, klass) ->
    Expression.types[type] = klass
    klass.prototype.type = type
    
  type: null
  
  @types: {}
  
