(function() {
  var Assign, Document, Literal, ViewTemplate, build_dom_from, create_dom, traverse_and_build, _ref,
    __slice = Array.prototype.slice;

  Document = require('nodes/document').Document;

  Literal = require('nodes/literal').Literal;

  Assign = require('nodes/assign').Assign;

  ViewTemplate = require('view_template').ViewTemplate;

  _ref = require('dom'), create_dom = _ref.create_dom, traverse_and_build = _ref.traverse_and_build, build_dom_from = _ref.build_dom_from;

  Document.preprocessor('display', function() {
    var builder, display, dom_nodes, filename, filenames, layout, screen, template, _i, _len;
    builder = arguments[0], filenames = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    for (_i = 0, _len = filenames.length; _i < _len; _i++) {
      filename = filenames[_i];
      template = ViewTemplate.find(filename);
      if (layout = this.root().layout) {
        this.root().current_template = template;
        dom_nodes = create_dom(layout.process(this, builder));
        this.root().current_template = null;
      } else {
        dom_nodes = create_dom(template.process(this, builder));
      }
      screen = builder.current_screen();
      if (screen.is_wait_screen()) screen = screen.extend();
      display = screen.b('display');
      traverse_and_build(display, dom_nodes);
    }
    return this.create(Literal, "");
  });

}).call(this);
