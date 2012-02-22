(function() {
  var BooleanExpression, Expression, Format,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Expression = require('simulator/expression').Expression;

  Format = require('simulator/formatters').Format;

  Expression.register_type('boolean', BooleanExpression = (function(_super) {

    __extends(BooleanExpression, _super);

    function BooleanExpression() {
      BooleanExpression.__super__.constructor.apply(this, arguments);
    }

    BooleanExpression.prototype.evaluate = function() {
      if (this.format) {
        this.lvalue = new Format('string', this.format.toString(), this.lvalue.toString()).process();
      }
      switch (this.op) {
        case 'equal':
          return this.lvalue.toString() === this.rvalue.toString();
        case 'not_equal':
          this.op = 'equal';
          return !this.evaluate();
        case 'less':
          this.rvalue = parseInt(this.rvalue) - 1;
          this.op = 'less_or_equal';
          return this.evaluate();
        case 'less_or_equal':
          return parseInt(this.lvalue) <= parseInt(this.rvalue);
        case 'contains':
          return this.lvalue.toString().indexOf(this.rvalue.toString()) !== -1;
        default:
          throw new Error("Invalid boolean operation: " + this.op);
      }
    };

    return BooleanExpression;

  })(Expression));

}).call(this);
