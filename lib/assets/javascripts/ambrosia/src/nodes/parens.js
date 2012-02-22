(function() {
  var Assign, Base, Identifier, Operation, Parens,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __slice = Array.prototype.slice;

  Base = require('nodes/base').Base;

  Identifier = require('nodes/identifier').Identifier;

  Assign = require('nodes/assign').Assign;

  Operation = require('nodes/operation').Operation;

  exports.Parens = Parens = (function(_super) {

    __extends(Parens, _super);

    function Parens() {
      Parens.__super__.constructor.apply(this, arguments);
    }

    Parens.prototype.prepare = function() {
      this.op = this.create.apply(this, [Operation].concat(__slice.call(this.nodes)));
      this.id = this.create(Identifier, '__tmpvar');
      return this.assign = this.create(Assign, this.id, this.op);
    };

    Parens.prototype.type = function() {
      return this.assign.type();
    };

    Parens.prototype.to_code = function() {
      return "(" + (this.op.to_code()) + ")";
    };

    Parens.prototype.compile = function(b) {
      this.assign.compile(b);
      return "tmlvar:" + this.id.get_dependent_variable().name;
    };

    return Parens;

  })(Base);

}).call(this);
