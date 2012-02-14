(function() {
  var Builtins, Scope, Variable, debug;

  Builtins = function(scope) {
    var key, _results;
    _results = [];
    for (key in scope.defs) {
      _results.push(key);
    }
    return _results;
  };

  debug = function(mesg) {
    if (process.env['DEBUG']) return console.log(mesg);
  };

  exports.Variable = Variable = (function() {

    function Variable(name, _type, method) {
      this.name = name;
      this._type = _type != null ? _type : null;
      this.method = method != null ? method : false;
      debug("Created variable " + this.name + (this._type ? " with type " + this._type : ""));
      this.dependents = [];
    }

    Variable.prototype.depends_upon = function(other_variable) {
      if (!(other_variable === this || other_variable.type() === 'string')) {
        debug("type of " + this.name + " depends upon " + other_variable.name);
        return this.dependents.push(other_variable);
      }
    };

    Variable.prototype.is_method_reference = function() {
      return this.last_known_value && this.last_known_value.indexOf('#') === 0;
    };

    Variable.prototype.type = function() {
      var dep, type, _i, _len, _ref, _t;
      if (this._type === null && this.dependents.length > 0) {
        type = null;
        _ref = this.dependents;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          dep = _ref[_i];
          _t = dep.type();
          if (_t) {
            if (_t !== 'string') {
              return _t;
            } else {
              type = 'string';
            }
          }
        }
        return type;
      } else {
        return this._type;
      }
    };

    Variable.prototype.default_value = function() {
      switch (this.type()) {
        case 'string':
        case null:
          return '';
        default:
          return 0;
      }
    };

    Variable.prototype.setType = function(type, silenced, raise_warnings) {
      var message;
      if (silenced == null) silenced = false;
      if (raise_warnings == null) raise_warnings = false;
      if (this.type() !== null && type !== null) {
        if (this.type() !== type && this._type !== 'string') {
          message = "" + type + " variable " + this.name + " conflicts with a " + (this.type()) + " variable of the same name";
          if (raise_warnings) throw new Error(message);
          if (!silenced) console.log("Warning: " + message);
        }
      }
      if (this._type !== type) {
        debug("set type of " + this.name + " to " + type);
        return this._type = type;
      }
    };

    return Variable;

  })();

  exports.VariableScope = Scope = (function() {

    function Scope(prefix, parent) {
      if (prefix == null) prefix = null;
      this.parent = parent != null ? parent : null;
      this._prefix = (prefix ? "" + prefix + "." : "");
      this.defs = {};
      this.builtin = Builtins(this);
      this.subscopes = {};
    }

    Scope.prototype.to_simulator_scope = function(sim) {
      var def, localname, prefix, subscope, _ref, _ref2;
      if (sim == null) sim = {};
      _ref = this.defs;
      for (localname in _ref) {
        def = _ref[localname];
        sim[def.name] = {
          type: def.type(),
          value: def.default_value()
        };
      }
      _ref2 = this.subscopes;
      for (prefix in _ref2) {
        subscope = _ref2[prefix];
        subscope.to_simulator_scope(sim);
      }
      return sim;
    };

    Scope.prototype.prefix = function() {
      if (this.parent) {
        return this.parent.prefix() + this._prefix;
      } else {
        return this._prefix;
      }
    };

    Scope.prototype.warnings_silenced = function() {
      if (this._warnings_silenced) return true;
      if (this.parent) return this.parent.warnings_silenced();
      return false;
    };

    Scope.prototype.silence_warnings = function() {
      return this._warnings_silenced = true;
    };

    Scope.prototype.warnings_raised = function() {
      if (this._raise_warnings) return true;
      if (this.parent) return this.parent.warnings_raised();
      return false;
    };

    Scope.prototype.raise_warnings = function() {
      return this._raise_warnings = true;
    };

    Scope.prototype.define = function(name, type, method) {
      var qualified_name, variable;
      if (type == null) type = null;
      if (method == null) method = false;
      if (name.indexOf(".") === 0) {
        return this.root().define(name.slice(1), type, method);
      }
      qualified_name = this.prefix() + name;
      variable = this.find(name);
      if (variable) {
        if (type !== null) {
          variable.setType(type, this.warnings_silenced(), this.warnings_raised());
        }
      } else {
        this.defs[name] = variable = new Variable(qualified_name, type, method);
      }
      return variable;
    };

    Scope.prototype.silently_define = function(name, type, method) {
      var variable;
      if (type == null) type = null;
      if (method == null) method = false;
      if (name.indexOf(".") === 0) {
        return this.root().silently_define(name.slice(1), type, method);
      }
      variable = this.find(name);
      if (variable) {
        if (variable.type === null) variable.setType(type, true);
      } else {
        this.defs[name] = variable = new Variable(this.prefix() + name, type, method);
      }
      return variable;
    };

    Scope.prototype.type_of = function(value) {
      return value.type();
    };

    Scope.prototype.recalculate = function() {
      var def, localname, prefix, subscope, _ref, _ref2, _results;
      _ref = this.defs;
      for (localname in _ref) {
        def = _ref[localname];
        def.name = this.prefix() + localname;
      }
      _ref2 = this.subscopes;
      _results = [];
      for (prefix in _ref2) {
        subscope = _ref2[prefix];
        _results.push(subscope.recalculate());
      }
      return _results;
    };

    Scope.prototype.find = function(name, downward) {
      var def, localname, prefix, scope, _ref, _ref2;
      if (downward == null) downward = false;
      if (name.indexOf(".") === 0) {
        return this.root().find(name.slice(1), downward);
      }
      _ref = this.defs;
      for (localname in _ref) {
        def = _ref[localname];
        if (def.name === name || localname === name) return def;
      }
      if (this.parent && !downward) return this.parent.find(name, false);
      _ref2 = this.subscopes;
      for (prefix in _ref2) {
        scope = _ref2[prefix];
        prefix = this.prefix() + prefix;
        if (name.indexOf(prefix) === 0) return scope.find(name, true);
      }
      return null;
    };

    Scope.prototype.root = function() {
      var p, _p;
      p = this;
      _p = p.parent;
      while (_p) {
        p = _p;
        _p = p.parent;
      }
      return p;
    };

    Scope.prototype.tree = function() {
      return this.root().dump();
    };

    Scope.prototype.dump = function() {
      var localname, prefix, subscope, variable, _ref, _ref2, _results;
      _ref = this.defs;
      for (localname in _ref) {
        variable = _ref[localname];
        console.log(this.prefix() + localname + " => " + variable.name);
      }
      _ref2 = this.subscopes;
      _results = [];
      for (prefix in _ref2) {
        subscope = _ref2[prefix];
        _results.push(subscope.dump());
      }
      return _results;
    };

    Scope.prototype.lookup = function(name) {
      var v;
      if (!name) throw new Error("No name given");
      if (v = this.find(name)) return v;
      throw new Error("" + (/\./.test(name) ? name : this.prefix() + name) + " is not defined");
    };

    Scope.prototype.sub = function(prefix) {
      var scope;
      if (!prefix) throw new Error("Can't subscope without a prefix");
      if (prefix[0] === '.') return this.root().sub(prefix.slice(1));
      scope = new Scope(prefix, this);
      return this.subscopes[scope.prefix()] = scope;
    };

    Scope.prototype.compile = function(builder) {
      var name, prefix, scope, variable, _ref, _ref2;
      if (builder.root) builder = builder.root;
      _ref = this.defs;
      for (name in _ref) {
        variable = _ref[name];
        builder.vardcl(variable.name, variable.type() || "string");
      }
      _ref2 = this.subscopes;
      for (prefix in _ref2) {
        scope = _ref2[prefix];
        scope.compile(builder);
      }
      return builder;
    };

    return Scope;

  })();

}).call(this);
