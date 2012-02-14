(function() {
  var Document, Literal, ViewTemplate;

  Document = require('nodes/document').Document;

  Literal = require('nodes/literal').Literal;

  ViewTemplate = require('view_template').ViewTemplate;

  Document.preprocessor('layout', function(builder, filename) {
    this.root().layout = ViewTemplate.find(filename);
    return this.create(Literal, "");
  });

  Document.preprocessor("yield", function(builder) {
    var dom, template;
    if (template = this.root().current_template) {
      dom = template.process(this, builder);
      return this.create(Literal, dom);
    } else {
      return false;
    }
  });

}).call(this);
