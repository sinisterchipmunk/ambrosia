(function() {
  var Base, Identifier, MethodReference,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Base = require('nodes/base').Base;

  Identifier = require('nodes/identifier').Identifier;

  exports.MethodReference = MethodReference = (function(_super) {

    __extends(MethodReference, _super);

    function MethodReference() {
      MethodReference.__super__.constructor.apply(this, arguments);
    }

    MethodReference.prototype.children = function() {
      return ['value'];
    };

    MethodReference.prototype.type = function() {
      return "string";
    };

    MethodReference.prototype.to_code = function() {
      return ":" + (this.value.to_code());
    };

    MethodReference.prototype.compile = function(builder) {
      if (this.value instanceof Identifier) {
        return "#" + this.value.name;
      } else {
        return "#" + (this.value.compile(builder));
      }
    };

    return MethodReference;

  })(Base);

}).call(this);
