(function() {
  var Extension, ForOf,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Extension = require('nodes/extension').Extension;

  exports.ForOf = ForOf = (function(_super) {

    __extends(ForOf, _super);

    function ForOf() {
      ForOf.__super__.constructor.apply(this, arguments);
    }

    ForOf.prototype.children = function() {
      return ['varid', 'expression', 'block'];
    };

    ForOf.prototype.type = function() {
      return 'string';
    };

    ForOf.prototype.to_code = function() {
      return "for " + (this.varid.to_code()) + " of " + (this.expression.to_code()) + "\n" + (this.block.to_code());
    };

    ForOf.prototype.compile = function(b) {
      var closure, current_screen;
      this.require(b, 'std/for_of');
      this.depend('closure');
      current_screen = b.root.current_screen().attrs.id;
      closure = this.create(Closure, [this.varid], this.block);
      closure.compile(b.root);
      b.root.goto(current_screen);
      return this.invoke(b, "for_of", this.expression, 0, this.method(closure.getID()));
    };

    return ForOf;

  })(Extension);

}).call(this);
