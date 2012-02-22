(function() {
  var Extension, Throw,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Extension = require('nodes/extension').Extension;

  exports.Throw = Throw = (function(_super) {

    __extends(Throw, _super);

    function Throw() {
      Throw.__super__.constructor.apply(this, arguments);
    }

    Throw.prototype.children = function() {
      return ['expression'];
    };

    Throw.prototype.to_code = function() {
      return "throw " + (this.expression.to_code());
    };

    Throw.prototype.compile = function(b) {
      this["import"](b, 'std/throw');
      return this.invoke(b, 'throw_error', this.expression);
    };

    return Throw;

  })(Extension);

}).call(this);
