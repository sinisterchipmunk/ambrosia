(function() {
  var Block, Extension, Identifier, Switch,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Extension = require('nodes/extension').Extension;

  Block = require('nodes/block').Block;

  Identifier = require('nodes/identifier').Identifier;

  exports.Switch = Switch = (function(_super) {

    __extends(Switch, _super);

    function Switch() {
      Switch.__super__.constructor.apply(this, arguments);
    }

    Switch.prototype.to_code = function() {
      var header, whens, _else, _when;
      header = "switch " + (this.expression.to_code()) + "\n";
      whens = (function() {
        var _i, _len, _ref, _results;
        _ref = this.whens;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          _when = _ref[_i];
          _results.push("  when " + (_when[0].to_code()) + "\n" + (this.indent(_when[1])));
        }
        return _results;
      }).call(this);
      _else = (this.else_block ? "\n  else\n" + (this.indent(this.else_block)) : "");
      return header + whens.join("\n") + _else;
    };

    Switch.prototype.children = function() {
      return ['expression', 'whens', 'else_block'];
    };

    Switch.prototype.type = function() {
      return this.expression.type();
    };

    Switch.prototype.prepare = function() {
      var If, Operation, new_if, _i, _if, _len, _ref, _when;
      If = require('nodes/if').If;
      Operation = require('nodes/operation').Operation;
      this.actual_value = this.create(Identifier, 'switch.actual_value');
      this._if = _if = null;
      _ref = this.whens;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        _when = _ref[_i];
        new_if = this.create(If, this.create(Operation, this.actual_value, '==', _when[0]), _when[1], 'if');
        if (this._if) {
          _if.addElse(this.create(Block, [new_if]));
          _if = new_if;
        } else {
          this._if = _if = new_if;
        }
      }
      if (this.else_block) return _if.addElse(this.else_block);
    };

    Switch.prototype.compile = function(b) {
      this.assign(b, this.actual_value, this.expression);
      return this._if.compile(b.root.current_screen());
    };

    return Switch;

  })(Extension);

}).call(this);
