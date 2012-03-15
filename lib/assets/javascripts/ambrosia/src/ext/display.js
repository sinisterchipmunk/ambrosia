(function() {
  var Assign, Document, Literal, ViewTemplate, build_dom_from, create_dom, frontend_element, traverse_and_build, _ref,
    __slice = Array.prototype.slice;

  Document = require('nodes/document').Document;

  Literal = require('nodes/literal').Literal;

  Assign = require('nodes/assign').Assign;

  ViewTemplate = require('view_template').ViewTemplate;

  _ref = require('dom'), create_dom = _ref.create_dom, traverse_and_build = _ref.traverse_and_build, build_dom_from = _ref.build_dom_from;

  frontend_element = function() {
    var builder, dom_nodes, element_name, frontend, layout, screen, template, templates, _i, _len;
    element_name = arguments[0], builder = arguments[1], templates = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
    for (_i = 0, _len = templates.length; _i < _len; _i++) {
      template = templates[_i];
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
    var builder, string, strings;
    builder = arguments[0], strings = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return frontend_element.call.apply(frontend_element, [this, 'display', builder].concat(__slice.call((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = strings.length; _i < _len; _i++) {
        string = strings[_i];
        _results.push(new ViewTemplate(string));
      }
      return _results;
    })())));
  });

  Document.preprocessor('print', function() {
    var builder, string, strings;
    builder = arguments[0], strings = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return frontend_element.call.apply(frontend_element, [this, 'print', builder].concat(__slice.call((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = strings.length; _i < _len; _i++) {
        string = strings[_i];
        _results.push(new ViewTemplate(string));
      }
      return _results;
    })())));
  });

  Document.preprocessor('show_view', function() {
    var builder, filename, filenames;
    builder = arguments[0], filenames = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return frontend_element.call.apply(frontend_element, [this, 'display', builder].concat(__slice.call((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = filenames.length; _i < _len; _i++) {
        filename = filenames[_i];
        _results.push(ViewTemplate.find(filename));
      }
      return _results;
    })())));
  });

  Document.preprocessor('print_view', function() {
    var builder, filename, filenames;
    builder = arguments[0], filenames = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return frontend_element.call.apply(frontend_element, [this, 'print', builder].concat(__slice.call((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = filenames.length; _i < _len; _i++) {
        filename = filenames[_i];
        _results.push(ViewTemplate.find(filename));
      }
      return _results;
    })())));
  });

}).call(this);
