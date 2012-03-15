(function() {
  var Document;

  Document = require('nodes/document').Document;

  Document.preprocessor('builtin', function(builder, name, value) {
    var type, variable;
    switch (typeof value) {
      case 'string':
        type = 'string';
        break;
      default:
        type = 'integer';
    }
    variable = this.current_scope().root().define(name, type);
    return "";
  });

}).call(this);
