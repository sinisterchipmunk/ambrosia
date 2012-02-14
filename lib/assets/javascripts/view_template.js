(function() {
  var Assign, Identifier, Layout, Literal, MethodCall, Variable, ViewTemplate, fs, path,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Variable = require('variable_scope').Variable;

  Assign = require('nodes/assign').Assign;

  Identifier = require('nodes/identifier').Identifier;

  MethodCall = require('nodes/method_call').MethodCall;

  Literal = require('nodes/literal').Literal;

  path = require('path');

  fs = require('fs');

  exports.ViewTemplate = ViewTemplate = (function() {
    var read_template_from_path, varid;

    varid = 0;

    read_template_from_path = function(filepath) {
      var _base;
      if (!path.extname(filepath)) filepath = "" + filepath + ".xml";
      try {
        return (_base = ViewTemplate.views)[filepath] || (_base[filepath] = new ViewTemplate(fs.readFileSync(filepath, 'UTF-8')));
      } catch (e) {
        return null;
      }
    };

    ViewTemplate.find = function(filename) {
      var filepath, template, view_path, view_paths, _i, _len;
      view_paths = ViewTemplate.paths();
      ViewTemplate.views || (ViewTemplate.views = {});
      if (filename[0] === /[//\\]/) {
        return read_template_from_path(filename);
      } else {
        for (_i = 0, _len = view_paths.length; _i < _len; _i++) {
          view_path = view_paths[_i];
          if (view_path[0] === '.') {
            view_path = path.join(process.cwd(), view_path);
          }
          filepath = path.normalize(path.join(view_path, filename));
          template = read_template_from_path(filepath);
          if (template) return template;
        }
      }
      throw new Error("Could not find view \"" + filename + "\" in view paths " + (JSON.stringify($.view_paths)));
    };

    ViewTemplate.paths = function() {
      return $.view_paths;
    };

    function ViewTemplate(content) {
      this.content = content;
    }

    ViewTemplate.prototype.each_match = function(start_token, stop_token, content, callback) {
      var match, start, stop;
      while ((start = content.indexOf(start_token)) !== -1) {
        stop = content.indexOf(stop_token);
        if (stop === -1 || stop < start) {
          throw new Error("Unmatched " + start_token);
        }
        match = content.substring(start + start_token.length, stop);
        content = content.replace(start_token + match + stop_token, callback(match));
      }
      return content;
    };

    ViewTemplate.prototype.create_id = function() {
      return this.context.create(Identifier, "embedded_" + (varid++));
    };

    ViewTemplate.prototype.process_code = function(code) {
      return this.context.create(MethodCall, this.context.create(Identifier, 'eval'), [this.context.create(Literal, code.trim())]);
    };

    ViewTemplate.prototype.assign_code_eval = function(code) {
      var assign, id, result;
      result = this.process_code(code).compile(this.builder);
      if (result instanceof Variable) {
        id = this.create_id();
        assign = this.context.create(Assign, id, this.context.create(Identifier, result.name));
        assign.compile(this.builder);
        return "<getvar name=\"" + result.name + "\" />";
      } else {
        return result;
      }
    };

    ViewTemplate.prototype.process_embedded_values = function(content) {
      var _this = this;
      return this.each_match('<%=', '%>', content, function(match) {
        return _this.assign_code_eval(match);
      });
    };

    ViewTemplate.prototype.process_embedded_code = function(content) {
      var _this = this;
      return this.each_match('<%', '%>', content, function(code) {
        var call;
        call = _this.process_code(code);
        call.compile(_this.builder);
        return "";
      });
    };

    ViewTemplate.prototype.process = function(context, builder) {
      var content;
      this.context = context;
      this.builder = builder;
      content = this.process_embedded_values(this.content);
      content = this.process_embedded_code(content);
      return content;
    };

    return ViewTemplate;

  })();

  exports.Layout = Layout = (function(_super) {

    __extends(Layout, _super);

    function Layout() {
      Layout.__super__.constructor.apply(this, arguments);
    }

    return Layout;

  })(ViewTemplate);

}).call(this);
