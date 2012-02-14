(function() {
  var Ary, Base, Identifier, Variable,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __slice = Array.prototype.slice;

  Base = require('nodes/base').Base;

  Variable = require('variable_scope').Variable;

  Identifier = require('nodes/identifier').Identifier;

  exports.Array = Ary = (function(_super) {

    __extends(Ary, _super);

    function Ary() {
      var nodes;
      nodes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this.nodes = nodes;
      this.values = nodes.shift();
      Ary.__super__.constructor.apply(this, nodes);
    }

    Ary.prototype.type = function() {
      return 'string';
    };

    Ary.prototype.children = function() {
      return [];
    };

    Ary.prototype.get_dependent_variable = function() {
      return this.values.get_dependent_variable();
    };

    Ary.prototype.to_code = function() {
      return "[" + (this.real().join(',')) + "]";
    };

    Ary.prototype.prepare = function() {};

    Ary.prototype.real = function() {
      var val, _i, _len, _ref, _results;
      _ref = this.values;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        val = _ref[_i];
        _results.push(val.value);
      }
      return _results;
    };

    Ary.prototype.compile = function(screen) {
      var val;
      return ((function() {
        var _i, _len, _ref, _results;
        _ref = this.values;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          val = _ref[_i];
          _results.push(val.value);
        }
        return _results;
      }).call(this)).join(';');
    };

    return Ary;

  })(Base);

}).call(this);
