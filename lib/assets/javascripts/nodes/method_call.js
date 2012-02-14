(function() {
  var Base, Document, Extension, MethodCall, NameRegistry, Variable,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __slice = Array.prototype.slice;

  NameRegistry = require('tml_builder').NameRegistry;

  Extension = require('nodes/extension').Extension;

  Document = require('nodes/document').Document;

  Base = require('nodes/base').Base;

  Variable = require('variable_scope').Variable;

  exports.MethodCall = MethodCall = (function(_super) {

    __extends(MethodCall, _super);

    function MethodCall() {
      MethodCall.__super__.constructor.apply(this, arguments);
    }

    MethodCall.prototype.children = function() {
      return ['method_name', 'params'];
    };

    MethodCall.prototype.type = function() {
      var variable;
      if (variable = this.current_scope().find(this.getMethodName())) {
        if (variable.is_method_reference()) return variable.type();
      }
      return this.root().find_method(this.getMethodName()).type(this.params);
    };

    MethodCall.prototype.getMethodName = function() {
      if (this._method_name) return this._method_name;
      return this._method_name = this.method_name.name;
    };

    MethodCall.prototype.prepare = function() {
      var prep, preps;
      if (this.getMethodName() === 'raise_warnings' || this.getMethodName() === 'silence_warnings') {
        this.current_scope()[this.getMethodName()]();
        return this.compile = function(screen) {};
      } else {
        preps = Document.preprocessors;
        if (preps && (prep = preps[this.getMethodName()])) {
          return this.compile = function(b) {
            var param, result, sys, _ref;
            result = (_ref = prep.invoke).call.apply(_ref, [this, b.root].concat(__slice.call((function() {
              var _i, _len, _ref, _results;
              _ref = this.params;
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                param = _ref[_i];
                _results.push(param.compile(b));
              }
              return _results;
            }).call(this))));
            if (result instanceof Variable || result instanceof Base) {
              this.type = function() {
                return result.type();
              };
              if (result.compile) return result.compile(b);
            } else if (typeof result === 'string') {
              this.type = function() {
                return 'string';
              };
            } else if (typeof result === 'number') {
              this.type = function() {
                return 'integer';
              };
            } else if (result === false) {
              return MethodCall.prototype.compile.call(this, b);
            } else {
              sys = require('sys');
              throw new Error("" + (this.getMethodName()) + ": return value of preprocessor invocation must be `false` to pass through, or a String, Number, Variable or compileable instance of Base (got " + (sys.inspect(result)) + ")");
            }
            return result;
          };
        }
      }
    };

    MethodCall.prototype.get_dependent_variable = function() {
      var function_screen_id, method, variable;
      function_screen_id = this.getMethodName();
      if (variable = this.current_scope().find(function_screen_id)) {
        return null;
      } else {
        method = this.root().find_method(function_screen_id);
        return method.getReturnVariable();
      }
    };

    MethodCall.prototype.to_code = function() {
      var param;
      return "" + (this.getMethodName()) + "(" + (((function() {
        var _i, _len, _ref, _results;
        _ref = this.params;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          param = _ref[_i];
          _results.push(param.to_code());
        }
        return _results;
      }).call(this)).join(', ')) + ")";
    };

    MethodCall.prototype.compile = function(builder) {
      var dest, function_screen_id, i, match, method, param, param_list, param_name, param_type, return_screen_id, screen, v, variable, _ref;
      this.depend('assign', 'identifier', 'literal');
      screen = builder.root.current_screen();
      function_screen_id = this.getMethodName();
      return_screen_id = "" + screen.attrs['id'] + "_" + (builder.root.name_registry.register(function_screen_id));
      if (variable = this.current_scope().find(function_screen_id)) {
        function_screen_id = "tmlvar:" + variable.name;
        if (variable.last_known_value && (match = /\#(.*)$/.exec(variable.last_known_value))) {
          method = this.root().find_method(match[1]);
        }
      } else {
        method = this.root().find_method(function_screen_id);
        if (this.params.length !== method.params.length) {
          throw new Error("Invalid parameter count: " + this.params.length + " for " + method.params.length);
        }
      }
      param_list = [];
      for (i = 0, _ref = this.params.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
        param = this.params[i];
        variable = param_type = null;
        if (param instanceof Identifier) {
          variable = param.get_dependent_variable();
          param_list.push("tmlvar:" + variable.name);
        } else {
          param_list.push(param.compile(screen));
          param_type = param.type();
        }
        if (method) {
          param_name = method.params[i].name;
          v = method.current_scope().define(param_name, param_type);
          if (variable) v.depends_upon(variable);
          this.assign(screen, v.name, param);
        } else {
          this.current_scope().silently_define(".__generic_method_param_" + i, 'string');
          this.assign(screen, ".__generic_method_param_" + i, param);
        }
      }
      if (!method) this.assign(screen, ".__generic_method", true);
      screen.root.current_screen().call_method(function_screen_id, return_screen_id);
      dest = screen.root.screen(return_screen_id);
      screen.attrs.next = "#" + dest.attrs.id;
      if (method) {
        return method.getReturnVariable();
      } else {
        return null;
      }
    };

    return MethodCall;

  })(Extension);

}).call(this);
