(function() {
  var Assign, Document, Literal, ViewTemplate, create_dom,
    __slice = Array.prototype.slice;

  Document = require('nodes/document').Document;

  Literal = require('nodes/literal').Literal;

  Assign = require('nodes/assign').Assign;

  ViewTemplate = require('view_template').ViewTemplate;

  create_dom = require('dom').create_dom;

  Document.preprocessor('display', function() {
    var builder, dom, filename, filenames, layout, screen, template, traverse, _i, _len;
    builder = arguments[0], filenames = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    for (_i = 0, _len = filenames.length; _i < _len; _i++) {
      filename = filenames[_i];
      template = ViewTemplate.find(filename);
      if (layout = this.root().layout) {
        this.root().current_template = template;
        dom = create_dom(layout.process(this, builder));
        this.root().current_template = null;
      } else {
        dom = create_dom(template.process(this, builder));
      }
      screen = builder.current_screen();
      if (screen.is_wait_screen()) screen = screen.extend();
      traverse = function(b) {
        var attr, attrs, name, node, value, _j, _k, _len2, _len3, _ref, _ref2;
        _ref = b.attrs.dom_nodes;
        for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
          node = _ref[_j];
          attrs = {
            dom_nodes: node.childNodes
          };
          if (node.attributes) {
            _ref2 = node.attributes;
            for (_k = 0, _len3 = _ref2.length; _k < _len3; _k++) {
              attr = _ref2[_k];
              name = attr.name;
              value = attr.value;
              attrs[name] = value;
            }
          }
          if (node.nodeName === '#text') {
            attrs.value = node.nodeValue.trim();
            if (attrs.value === "") continue;
          }
          b.b(node.nodeName.toLowerCase(), attrs, traverse);
        }
        return delete b.attrs.dom_nodes;
      };
      screen.b('display', {
        dom_nodes: dom
      }, traverse);
    }
    return this.create(Literal, "");
  });

}).call(this);
