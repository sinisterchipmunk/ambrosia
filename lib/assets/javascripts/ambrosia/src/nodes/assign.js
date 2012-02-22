(function() {
  var Assign, Base, Identifier, Variable,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Base = require('nodes/base').Base;

  Variable = require('variable_scope').Variable;

  Identifier = require('nodes/identifier').Identifier;

  exports.Assign = Assign = (function(_super) {

    __extends(Assign, _super);

    function Assign() {
      Assign.__super__.constructor.apply(this, arguments);
    }

    Assign.prototype.type = function() {
      return this.rvalue.type();
    };

    Assign.prototype.children = function() {
      return ['lvalue', 'rvalue'];
    };

    Assign.prototype.get_dependent_variable = function() {
      return this.lvalue.get_dependent_variable();
    };

    Assign.prototype.to_code = function() {
      return this.lvalue.to_code() + " = " + this.rvalue.to_code();
    };

    Assign.prototype.prepare = function() {};

    Assign.prototype.compile = function(screen) {
      var dependent, lval, rval, setvar, type;
      if (this.lvalue instanceof Assign) {
        throw new Error("Can't use assignment as left value");
      }
      rval = this.rvalue.compile(screen.root.current_screen());
      screen = screen.root.current_screen();
      if (screen.is_wait_screen()) screen = screen.extend();
      type = this.rvalue.type();
      dependent = this.rvalue instanceof Identifier && this.rvalue.get_dependent_variable();
      if (dependent instanceof Variable && dependent.name.indexOf("__generic_method_param") === 0) {
        type = null;
      }
      if (this.lvalue.name.slice(0, 2) === '$.') {
        $[this.lvalue.name.slice(2)] = this.rvalue.real();
      } else {
        lval = this.current_scope().define(this.lvalue.name, type);
        setvar = screen.b('setvar', {
          name: lval.name
        });
        this.lvalue.assign_value(setvar, rval, type || 'string');
      }
      return lval;
    };

    return Assign;

  })(Base);

}).call(this);
