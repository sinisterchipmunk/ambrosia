(function() {
  var Base, EmbeddedTML, create_dom,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Base = require('nodes/base').Base;

  create_dom = require('dom').create_dom;

  exports.EmbeddedTML = EmbeddedTML = (function(_super) {

    __extends(EmbeddedTML, _super);

    function EmbeddedTML() {
      EmbeddedTML.__super__.constructor.apply(this, arguments);
    }

    EmbeddedTML.prototype.children = function() {
      return ['tml'];
    };

    EmbeddedTML.prototype.to_code = function() {
      return "`\n" + this.tml + "\n`";
    };

    EmbeddedTML.prototype.prepare = function() {};

    EmbeddedTML.prototype.compile = function(screen) {
      var dom, traverse;
      dom = create_dom(this.tml);
      screen = screen.root.current_screen();
      traverse = function(b) {
        var attr, attrs, name, node, value, _i, _j, _len, _len2, _ref, _ref2;
        _ref = b.attrs.dom_nodes;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          node = _ref[_i];
          attrs = {
            dom_nodes: node.childNodes
          };
          if (node.attributes) {
            _ref2 = node.attributes;
            for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
              attr = _ref2[_j];
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
      screen.attrs.dom_nodes = dom;
      traverse(screen);
      return "";
    };

    return EmbeddedTML;

  })(Base);

}).call(this);
