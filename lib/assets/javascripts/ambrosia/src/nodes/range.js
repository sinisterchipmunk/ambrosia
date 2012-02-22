(function() {
  var Base, Literal, Operation, Parens, Range,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Base = require('nodes/base').Base;

  Literal = require('nodes/literal').Literal;

  Operation = require('nodes/operation').Operation;

  Parens = require('nodes/parens').Parens;

  exports.Range = Range = (function(_super) {

    __extends(Range, _super);

    function Range(start, stop, inclusive) {
      this.start = start;
      this.stop = stop;
      this.inclusive = inclusive != null ? inclusive : true;
      Range.__super__.constructor.call(this);
      if (!this.inclusive) {
        this.stop = this.create(Parens, this.create(Operation, this.stop, "-", this.create(Literal, 1)));
      }
    }

    Range.prototype.to_code = function() {
      return "[" + (this.start.to_code()) + ".." + (this.stop.to_code()) + "]";
    };

    Range.prototype.prepare = function() {
      return this.step = this.create(Literal, 1);
    };

    Range.prototype.type = function() {
      return 'integer';
    };

    Range.prototype.compile = function(b) {};

    return Range;

  })(Base);

}).call(this);
