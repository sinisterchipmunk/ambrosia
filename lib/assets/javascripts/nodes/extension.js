(function() {
  var Assign, Base, Extension,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __slice = Array.prototype.slice;

  Base = require('nodes/base').Base;

  Assign = require('nodes/assign').Assign;

  exports.Extension = Extension = (function(_super) {

    __extends(Extension, _super);

    function Extension() {
      Extension.__super__.constructor.apply(this, arguments);
    }

    Extension.prototype.depend = function() {
      var camel, dep, deps, match, _i, _len, _results;
      deps = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _results = [];
      for (_i = 0, _len = deps.length; _i < _len; _i++) {
        dep = deps[_i];
        camel = dep;
        while (match = /((^[a-z])|(_[a-z]))/.exec(camel)) {
          camel = camel.replace(match[1], match[1][match[1].length - 1].toUpperCase());
        }
        if (eval("typeof " + camel) === 'undefined') {
          _results.push(eval("" + camel + " = require('nodes/" + dep + "')." + camel));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Extension.prototype.require = function(builder, path) {
      var current_screen;
      current_screen = builder.root.current_screen().attrs.id;
      if (!path) throw new Error("path is required");
      this.invoke(builder, "require", path);
      return builder.root.goto(current_screen);
    };

    Extension.prototype.invoke = function() {
      var arg, args, builder, method_name, proc, self;
      builder = arguments[0], method_name = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      this.depend('literal', 'method_call', 'identifier');
      self = this;
      proc = function(arg, type) {
        if (type == null) type = Literal;
        if (arg instanceof Base) {
          return arg;
        } else {
          return self.create(type, arg);
        }
      };
      args = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = args.length; _i < _len; _i++) {
          arg = args[_i];
          _results.push(proc(arg));
        }
        return _results;
      })();
      method_name = proc(method_name, Identifier);
      return this.create(MethodCall, method_name, args).compile(builder);
    };

    Extension.prototype.method = function(name) {
      this.depend('method_reference');
      if (name instanceof Base) {
        return this.create(MethodReference, name);
      } else {
        this.depend('literal');
        return this.create(MethodReference, this.create(Literal, name));
      }
    };

    Extension.prototype.assign = function(builder, lvalue, rvalue) {
      this.depend('identifier', 'literal', 'base');
      if (!(lvalue instanceof Base)) lvalue = this.create(Identifier, lvalue);
      if (!(rvalue instanceof Base)) rvalue = this.create(Literal, rvalue);
      return this.create(Assign, lvalue, rvalue).compile(builder);
    };

    return Extension;

  })(Base);

}).call(this);
