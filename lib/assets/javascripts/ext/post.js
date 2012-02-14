(function() {
  var Document, Literal, ViewTemplate,
    __slice = Array.prototype.slice;

  Document = require('nodes/document').Document;

  Literal = require('nodes/literal').Literal;

  ViewTemplate = require('view_template').ViewTemplate;

  Document.preprocessor('post', function() {
    var builder, path, screen, variables,
      _this = this;
    builder = arguments[0], path = arguments[1], variables = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
    screen = builder.root.current_screen();
    screen.b('submit', {
      tgt: path
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
