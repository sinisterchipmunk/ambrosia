(function() {
  var Document, Extension, TMLBuilder, VariableScope,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __slice = Array.prototype.slice;

  Extension = require('nodes/extension').Extension;

  TMLBuilder = require('tml_builder').TMLBuilder;

  VariableScope = require('variable_scope').VariableScope;

  exports.Document = Document = (function(_super) {

    __extends(Document, _super);

    Document.preprocessors || (Document.preprocessors = {});

    function Document() {
      var nodes;
      nodes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this.scope = new VariableScope;
      this.methods = {};
      this.__dependencies = {};
      Document.__super__.constructor.apply(this, arguments);
    }

    Document.preprocessor = function() {
      var args, body, name, _i;
      name = arguments[0], args = 3 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), body = arguments[_i++];
      if (Document.preprocessors[name]) {
        throw new Error("A preprocessor named " + name + " already exists");
      }
      return Document.preprocessors[name] = {
        name: name,
        invoke: body
      };
    };

    Document.prototype.instance_name = function() {
      return this.current_scope().prefix() + Document.__super__.instance_name.apply(this, arguments);
    };

    Document.prototype.silently_find_method = function(name) {
      var retval;
      if (this.methods[name]) return this.methods[name];
      retval = null;
      this.each_dependency(function(dep) {
        var method;
        if (method = dep.silently_find_method(name)) {
          return retval || (retval = method);
        }
      });
      return retval;
    };

    Document.prototype.each_dependency = function(callback) {
      var dep, doc, _ref, _results;
      _ref = this.__dependencies;
      _results = [];
      for (dep in _ref) {
        doc = _ref[dep];
        _results.push(callback(doc));
      }
      return _results;
    };

    Document.prototype.find_method = function(name) {
      var method;
      if (method = this.silently_find_method(name)) return method;
      throw new Error("No method named " + name);
    };

    Document.prototype.children = function() {
      return ['block'];
    };

    Document.prototype.to_code = function() {
      return this.block.to_code();
    };

    Document.prototype.prepare = function() {
      return this.each_dependency(function(dep) {
        return dep.run_prepare_blocks();
      });
    };

    Document.prototype.compileDOM = function(builder) {
      if (builder == null) builder = new TMLBuilder;
      this.run_prepare_blocks();
      this.find_method('__main__').compile(builder);
      this.current_scope().compile(builder);
      return builder;
    };

    Document.prototype.compile = function(builder, optimize) {
      if (optimize == null) optimize = true;
      return this.compileDOM(builder).root;
    };

    return Document;

  })(Extension);

}).call(this);
