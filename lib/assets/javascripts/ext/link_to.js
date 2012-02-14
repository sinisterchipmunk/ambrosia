(function() {
  var Document, Literal, ViewTemplate;

  Document = require('nodes/document').Document;

  Literal = require('nodes/literal').Literal;

  ViewTemplate = require('view_template').ViewTemplate;

  Document.preprocessor('link_to', function(builder, caption, method_reference) {
    return "<a href=\"" + method_reference + "\">" + caption + "</a>";
  });

}).call(this);
