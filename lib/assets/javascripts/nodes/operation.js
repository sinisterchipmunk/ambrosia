(function() {
  var Assign, Base, Identifier, Operation, Variable,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Base = require('nodes/base').Base;

  Identifier = require('nodes/identifier').Identifier;

  Assign = require('nodes/assign').Assign;

  Variable = require("variable_scope").Variable;

  exports.Operation = Operation = (function(_super) {

    __extends(Operation, _super);

    function Operation() {
      Operation.__super__.constructor.apply(this, arguments);
    }

    Operation.prototype.children = function() {
      return ['lvalue', 'op', 'rvalue'];
    };

    Operation.prototype.type = function() {
      if (this.lvalue instanceof Identifier && this.lvalue.name === ".__method_params") {
        return null;
      }
      return this.lvalue.type() || this.rvalue.type();
    };

    Operation.prototype.to_code = function() {
      if (this.rvalue) {
        return "" + (this.lvalue.to_code()) + " " + this.op + " " + (this.rvalue.to_code());
      } else {
        return this.lvalue.to_code();
      }
    };

    Operation.prototype.get_dependent_variable = function() {
      if (this.lvalue instanceof Base) {
        return this.lvalue.get_dependent_variable();
      } else if (this.lvalue instanceof Variable) {
        return this.lvalue;
      } else {
        return null;
      }
    };

    Operation.prototype.prepare = function() {
      var _ref;
      if (this.op && this.op.indexOf(">") !== -1) {
        _ref = [this.rvalue, this.lvalue], this.lvalue = _ref[0], this.rvalue = _ref[1];
        if (this.op.indexOf('=' !== -1)) {
          return this.op = '<=';
        } else {
          return this.op = '<';
        }
      }
    };

    Operation.prototype.compile = function(screen) {
      var depth, lval, proc, result, result_variable, rval, self, setvar, _ref;
      self = this;
      proc = function(w, val) {
        var id, _v;
        if (val instanceof Operation) {
          id = self.create(Identifier, "__tmp" + w);
          self.create(Assign, id, val).compile(screen);
          return "tmlvar:" + id.get_dependent_variable().name;
        } else if (val instanceof Identifier) {
          return "tmlvar:" + val.get_dependent_variable().name;
        } else if (val instanceof Variable) {
          return "tmlvar:" + val.name;
        } else {
          _v = val.compile(screen);
          if (_v instanceof Variable) {
            return "tmlvar:" + _v.name;
          } else {
            return _v;
          }
        }
      };
      lval = proc('l', this.lvalue);
      if (!this.rvalue) return lval;
      rval = proc('r', this.rvalue);
      result = {
        lo: lval,
        ro: rval,
        op: (function() {
          switch (this.op) {
            case '+':
              return 'plus';
            case '-':
              return 'minus';
            case '==':
              return 'equal';
            case '!=':
              return 'not_equal';
            case '<=':
              return 'less_or_equal';
            case '<':
              return 'less';
            default:
              return this.op;
          }
        }).call(this)
      };
      if (this.op === '%') {
        result.format = result.ro;
        delete result.ro;
        delete result.op;
      }
      if (result.op && ((_ref = result.op) === 'equal' || _ref === 'not_equal' || _ref === 'less' || _ref === 'less_or_equal')) {
        return result;
      }
      depth = this.depth();
      result_variable = this.current_scope().define(".tmp." + (this.type()) + ".op" + depth, this.type());
      setvar = screen.root.current_screen().b('setvar', {
        name: result_variable.name
      });
      this.create(Identifier, result_variable.name).assign_value(setvar, result);
      return result_variable;
    };

    return Operation;

  })(Base);

}).call(this);
