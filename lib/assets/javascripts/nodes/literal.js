(function() {
  var Base, Literal,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Base = require('nodes/base').Base;

  exports.Literal = Literal = (function(_super) {

    __extends(Literal, _super);

    function Literal(value) {
      this.value = value;
      this.nodes = [];
    }

    Literal.prototype.type = function() {
      switch (typeof this.value) {
        case 'boolean':
        case 'string':
          return 'string';
        case 'number':
          return 'integer';
        case 'undefined':
          return 'string';
        default:
          if (this.value instanceof Array) {
            return 'string';
          } else {
            throw new Error("Untranslateable literal: " + (JSON.stringify(this.value)));
          }
      }
    };

    Literal.prototype.compile = function(builder) {
      if (this.value !== void 0) {
        if (this.value instanceof Array) {
          return this.value.join(';');
        } else {
          return this.value.toString();
        }
      } else {
        return "undefined";
      }
    };

    Literal.prototype.to_code = function() {
      return JSON.stringify(this.value);
    };

    Literal.prototype.real = function() {
      return this.value;
    };

    return Literal;

  })(Base);

}).call(this);
