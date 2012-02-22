(function() {
  var Expression, Format, StringExpression,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Expression = require('simulator/expression').Expression;

  Format = require('simulator/formatters').Format;

  Expression.register_type('string', StringExpression = (function(_super) {

    __extends(StringExpression, _super);

    function StringExpression() {
      StringExpression.__super__.constructor.apply(this, arguments);
    }

    StringExpression.prototype.evaluate = function() {
      var lval, rval;
      switch (this.op) {
        case 'plus':
          return this.lvalue.toString() + this.rvalue.toString();
        case 'minus':
          rval = parseInt(this.rvalue);
          lval = this.lvalue.toString();
          if (rval.toString() !== this.rvalue.toString()) {
            throw new Error("Can only subtract numeric values from String");
          }
          if (rval > 0) {
            return lval.substring(0, lval.length - rval);
          } else {
            return lval.substring(-rval, lval.length);
          }
          break;
        case 'item':
          rval = parseInt(this.rvalue);
          lval = this.lvalue.toString().split(';');
          if (rval < 0 || rval >= lval.length) {
            return ';';
          } else {
            return lval[rval];
          }
          break;
        case 'number':
          if (this.lvalue.toString() === "") {
            return 0;
          } else {
            return this.lvalue.toString().split(';').length;
          }
          break;
        case 'format':
          return new Format('string', this.rvalue.toString(), this.lvalue.toString()).process();
        default:
          if (this.format) {
            return new Format('string', this.format, this.lvalue.toString()).process();
          } else {
            if (this.op) {
              throw new Error("Invalid string operation: " + this.op);
            } else {
              return this.lvalue.toString();
            }
          }
      }
    };

    return StringExpression;

  })(Expression));

}).call(this);
