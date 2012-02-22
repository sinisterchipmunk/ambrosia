(function() {
  var Expression, NumberExpression,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Expression = require('simulator/expression').Expression;

  Expression.register_type('integer', NumberExpression = (function(_super) {

    __extends(NumberExpression, _super);

    function NumberExpression() {
      NumberExpression.__super__.constructor.apply(this, arguments);
    }

    NumberExpression.prototype.evaluate = function() {
      if (!this.rvalue) return this.lvalue;
      switch (this.op) {
        case 'plus':
          return this.lvalue + this.rvalue;
        case 'minus':
          return this.lvalue - this.rvalue;
        default:
          throw new Error("Invalid integer operation: " + this.op);
      }
    };

    return NumberExpression;

  })(Expression));

}).call(this);
