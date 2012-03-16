(function() {
  var Block, Closure, Extension, Identifier, MethodCall, Switch,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Extension = require('nodes/extension').Extension;

  Block = require('nodes/block').Block;

  Identifier = require('nodes/identifier').Identifier;

  Closure = require('nodes/closure').Closure;

  MethodCall = require('nodes/method_call').MethodCall;

  exports.Switch = Switch = (function(_super) {

    __extends(Switch, _super);

    function Switch() {
      Switch.__super__.constructor.apply(this, arguments);
    }

    Switch.prototype.to_code = function() {
      var header, w, whens, _else, _when;
      header = "switch " + (this.expression.to_code()) + "\n";
      whens = (function() {
        var _i, _len, _ref, _results;
        _ref = this.whens;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          _when = _ref[_i];
          _results.push("  when " + (((function() {
            var _j, _len2, _ref2, _results2;
            _ref2 = _when[0];
            _results2 = [];
            for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
              w = _ref2[_j];
              _results2.push(w.to_code());
            }
            return _results2;
          })()).join(', ')) + "\n" + (this.indent(_when[1])));
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
      var If, Operation, closure, condition, invocation, new_if, _i, _if, _j, _len, _len2, _ref, _ref2, _when;
      If = require('nodes/if').If;
      Operation = require('nodes/operation').Operation;
      this.actual_value = this.create(Identifier, 'switch.actual_value');
      this._if = _if = null;
      this.closures = [];
      _ref = this.whens;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        _when = _ref[_i];
        this.closures.push(closure = this.create(Closure, [], _when[1]));
        _ref2 = _when[0];
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          condition = _ref2[_j];
          invocation = this.create(Block, [this.create(MethodCall, this.create(Identifier, closure.getID()), [])]);
          new_if = this.create(If, this.create(Operation, this.actual_value, '==', condition), invocation, 'if');
          if (this._if) {
            _if.addElse(this.create(Block, [new_if]));
            _if = new_if;
          } else {
            this._if = _if = new_if;
          }
        }
      }
      if (this.else_block) return _if.addElse(this.else_block);
    };

    Switch.prototype.compile = function(b) {
      var closure, current_screen, _i, _len, _ref;
      this.assign(b, this.actual_value, this.expression);
      current_screen = b.root.current_screen();
      _ref = this.closures;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        closure = _ref[_i];
        closure.compile(b);
      }
      b.root.goto(current_screen);
      return this._if.compile(current_screen);
    };

    return Switch;

  })(Extension);

}).call(this);
