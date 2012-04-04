(function() {
  var Document, Literal, ViewTemplate,
    __slice = Array.prototype.slice;

  Document = require('nodes/document').Document;

  Literal = require('nodes/literal').Literal;

  ViewTemplate = require('view_template').ViewTemplate;

  Document.preprocessor('post', function() {
    var builder, handler, path, screen, variables,
      _this = this;
    builder = arguments[0], path = arguments[1], variables = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
    if (typeof path !== 'string') {
      throw new Error("First argument must be a path to post data to");
    }
    handler = variables[variables.length - 1];
    if (handler instanceof require('variable_scope').Variable) {
      handler = "#default_submit_error_handler";
      this["import"](builder, 'std/default_submit_error_handler');
    } else {
      variables = variables.slice(0, -1);
    }
    screen = builder.root.current_screen().extend();
    screen.b('submit', {
      tgt: path,
      econn: handler
    }, function(b) {
      var variable, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = variables.length; _i < _len; _i++) {
        variable = variables[_i];
        _results.push(b.b('getvar', {
          name: variable.name
        }));
      }
      return _results;
    });
    return this.create(Literal, "");
  });

}).call(this);
