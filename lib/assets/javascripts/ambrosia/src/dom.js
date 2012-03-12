(function() {
  var Builder, DefaultHandler, Parser, _ref;

  _ref = require('htmlparser'), Parser = _ref.Parser, DefaultHandler = _ref.DefaultHandler;

  Builder = require('builder').Builder;

  exports.create_dom = function(code) {
    var handler, parser;
    handler = new DefaultHandler(function(error, dom) {
      if (error) throw new Error(error);
    });
    parser = new Parser(handler);
    parser.parseComplete(code);
    return handler.dom;
  };

  exports.traverse_and_build = function(b, dom_nodes) {
    var attrs, built_node, name, node, value, _i, _len, _ref2, _results;
    _results = [];
    for (_i = 0, _len = dom_nodes.length; _i < _len; _i++) {
      node = dom_nodes[_i];
      attrs = {};
      if (node.attribs) {
        _ref2 = node.attribs;
        for (name in _ref2) {
          value = _ref2[name];
          attrs[name] = value;
        }
      }
      if (node.type === 'text') {
        node.name = '#text';
        attrs.value = node.data.trim();
        if (attrs.value === "") continue;
      }
      built_node = b.b(node.name.toLowerCase(), attrs);
      _results.push(exports.traverse_and_build(built_node, node.children || []));
    }
    return _results;
  };

  exports.build_dom_from = function(code, builder) {
    var dom_nodes;
    if (builder == null) builder = new Builder('__root__');
    dom_nodes = exports.create_dom(code);
    exports.traverse_and_build(builder, dom_nodes);
    if (builder.name === '__root__') {
      return builder.first('tml');
    } else {
      return builder;
    }
  };

}).call(this);
