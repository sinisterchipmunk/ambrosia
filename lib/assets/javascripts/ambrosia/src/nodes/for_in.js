(function() {
  var Extension, ForIn,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Extension = require('nodes/extension').Extension;

  exports.ForIn = ForIn = (function(_super) {

    __extends(ForIn, _super);

    function ForIn() {
      ForIn.__super__.constructor.apply(this, arguments);
    }

    ForIn.prototype.children = function() {
      return ['varid', 'expression', 'block'];
    };

    ForIn.prototype.type = function() {
      return 'string';
    };

    ForIn.prototype.to_code = function() {
      return "for " + (this.varid.to_code()) + " in " + (this.expression.to_code()) + "\n" + (this.block.to_code());
    };

    ForIn.prototype.compile = function(b) {
      var Closure, Range, closure, current_screen;
      Range = require('nodes/range').Range;
      Closure = require('nodes/closure').Closure;
      current_screen = b.root.current_screen().attrs.id;
      closure = this.create(Closure, [this.varid], this.block);
      closure.compile(b.root);
      if (this.expression instanceof Range) {
        this.require(b, "std/for_in_range");
        b.root.goto(current_screen);
        return this.invoke(b, "for_in_range", this.expression.start, this.expression.stop, this.expression.step, this.method(closure.getID()));
      } else {
        this.require(b, "std/for_in");
        b.root.goto(current_screen);
        return this.invoke(b, "for_in", this.expression, this.method(closure.getID()));
      }
    };

    return ForIn;

  })(Extension);

}).call(this);
