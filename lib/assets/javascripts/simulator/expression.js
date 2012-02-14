(function() {
  var Expression, Literalize;

  Literalize = require('simulator/common').Literalize;

  exports.Expression = Expression = (function() {

    function Expression(variable_state, expr) {
      this.variable_state = variable_state;
      this.format = expr.format;
      this.op = expr.op;
      if (expr.lo === void 0) {
        throw new Error("No lvalue in expression " + (JSON.stringify(expr)));
      }
      this.lvalue = Literalize(this.variable_state, expr.lo, this.type);
      if (expr.ro !== void 0 && expr.ro !== '') {
        this.rvalue = Literalize(this.variable_state, expr.ro, this.type);
      } else {
        this.rvalue = expr.ro;
      }
    }

    Expression.prototype.evaluate = function() {
      throw new Error("Override Expression#evaluate returning result");
    };

    Expression.evaluate = function(type, expr, variable_state) {
      if (variable_state == null) variable_state = {};
      if (Expression.types[type]) {
        return new Expression.types[type](variable_state, expr).evaluate();
      } else {
        throw new Error("No expression candidate for type " + type);
      }
    };

    Expression.register_type = function(type, klass) {
      Expression.types[type] = klass;
      return klass.prototype.type = type;
    };

    Expression.prototype.type = null;

    Expression.types = {};

    return Expression;

  })();

}).call(this);
