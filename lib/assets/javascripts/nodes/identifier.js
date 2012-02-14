(function() {
  var Base, Expression, Identifier, Literal, Variable, util,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Base = require('nodes/base').Base;

  Variable = require('variable_scope').Variable;

  Expression = require('simulator/expression').Expression;

  Literal = require('nodes/literal').Literal;

  util = require('util');

  require('simulator/all_expressions');

  exports.Identifier = Identifier = (function(_super) {

    __extends(Identifier, _super);

    function Identifier() {
      Identifier.__super__.constructor.apply(this, arguments);
    }

    Identifier.prototype.children = function() {
      return ['name'];
    };

    Identifier.prototype.type = function() {
      return this.get_dependent_variable().type();
    };

    Identifier.prototype.compile = function(b) {
      return this.get_dependent_variable();
    };

    Identifier.prototype.get_dependent_variable = function() {
      if (this.name.slice(0, 2) === '$.') {
        return new Literal($[this.name.slice(2)]);
      } else {
        return this.current_scope().lookup(this.name);
      }
    };

    Identifier.prototype.to_code = function() {
      return this.name;
    };

    Identifier.prototype.assign_value = function(setvar, val, expr_type) {
      var match, op_type, _ro, _var;
      if (expr_type == null) expr_type = null;
      _var = this.current_scope().define(this.name);
      if (val instanceof Variable) {
        _var.depends_upon(val);
        setvar.attrs.lo = "tmlvar:" + val.name;
        _var.last_known_value = val.last_known_value;
      } else if (val instanceof Literal) {
        _var.setType(val.type());
        setvar.attrs.lo = val.value;
        _var.last_known_value = val.value;
      } else if (typeof val === 'object') {
        setvar.attrs.lo = val.lo;
        if (val.lo instanceof Variable) {
          expr_type = val.lo.type();
          setvar.attrs.lo = "tmlvar:" + val.lo.name;
        }
        if (val.format !== void 0) {
          setvar.attrs.format = val.format;
        } else if (val.ro !== void 0) {
          setvar.attrs.ro = val.ro;
          setvar.attrs.op = val.op;
          if (val.ro instanceof Variable) {
            setvar.attrs.ro = "tmlvar:" + val.ro.name;
            expr_type || (expr_type = val.ro.type());
          }
        } else {
          throw new Error("Can't assign variable " + _var.name + " to no value (" + (util.inspect(val)) + ")");
        }
        if (op_type = expr_type || _var.type()) {
          _var.last_known_value = Expression.evaluate(op_type, setvar.attrs, this.current_scope().root().to_simulator_scope());
        }
      } else {
        setvar.attrs.lo = val;
        val = val.toString();
        if (val.indexOf(";") !== -1) {
          _var.setType('string');
          _var.last_known_value = val;
        } else if (match = /^tmlvar:(.*)$/.exec(val)) {
          _ro = this.current_scope().lookup(match[1]);
          if (!/^__generic_method_param_/.test(_ro.name)) _var.depends_upon(_ro);
          _var.last_known_value = _ro.last_known_value;
        } else {
          _var.last_known_value = val;
        }
      }
      return setvar;
    };

    return Identifier;

  })(Base);

}).call(this);
