(function() {
  var Assign, Document, Literal, ViewTemplate, build_dom_from, create_dom, frontend_element, traverse_and_build, _ref,
    __slice = Array.prototype.slice;

  Document = require('nodes/document').Document;

  Literal = require('nodes/literal').Literal;

  Assign = require('nodes/assign').Assign;

  ViewTemplate = require('view_template').ViewTemplate;

  _ref = require('dom'), create_dom = _ref.create_dom, traverse_and_build = _ref.traverse_and_build, build_dom_from = _ref.build_dom_from;

  frontend_element = function() {
    var builder, dom_nodes, element_name, filename, filenames, frontend, layout, screen, template, _i, _len;
    element_name = arguments[0], builder = arguments[1], filenames = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
    for (_i = 0, _len = filenames.length; _i < _len; _i++) {
      filename = filenames[_i];
      if (filename.indexOf("\n") === -1 && !/<[^>]+>/.test(filename)) {
        template = ViewTemplate.find(filename);
      } else {
        template = new ViewTemplate(filename);
      }
      if (layout = this.root().layout) {
        this.root().current_template = template;
        dom_nodes = create_dom(layout.process(this, builder));
        this.root().current_template = null;
      } else {
        dom_nodes = create_dom(template.process(this, builder));
      }
      screen = builder.current_screen();
      screen = screen.extend();
      frontend = screen.b(element_name);
      traverse_and_build(frontend, dom_nodes);
    }
    return this.create(Literal, "");
  };

  Document.preprocessor('display', function() {
    var builder, filenames;
    builder = arguments[0], filenames = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return frontend_element.call.apply(frontend_element, [this, 'display', builder].concat(__slice.call(filenames)));
  });

  Document.preprocessor('print', function() {
    var builder, filenames;
    builder = arguments[0], filenames = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return frontend_element.call.apply(frontend_element, [this, 'print', builder].concat(__slice.call(filenames)));
  });

}).call(this);
