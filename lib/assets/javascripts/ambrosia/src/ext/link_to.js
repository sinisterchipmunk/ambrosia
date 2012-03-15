(function() {
  var Document, Literal, Variable, ViewTemplate;

  Document = require('nodes/document').Document;

  Literal = require('nodes/literal').Literal;

  ViewTemplate = require('view_template').ViewTemplate;

  Variable = require('variable_scope').Variable;

  Document.preprocessor('link_to', function(builder, caption, method_reference) {
    var screen;
    if (method_reference instanceof Variable) {
      screen = builder.current_screen();
      builder.add_return_screen();
      builder.goto(screen.attrs.id);
      method_reference = "tmlvar:" + method_reference.name;
    }
    return "<a href=\"" + method_reference + "\">" + caption + "</a>";
  });

}).call(this);
