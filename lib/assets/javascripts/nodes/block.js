(function() {
  var Base, Block, Document, Return,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Base = require('nodes/base').Base;

  Document = require('nodes/document').Document;

  Return = require('nodes/return').Return;

  exports.Block = Block = (function(_super) {

    __extends(Block, _super);

    function Block(nodes) {
      Block.__super__.constructor.apply(this, nodes);
    }

    Block.prototype.to_code = function() {
      var node;
      return "  " + ((function() {
        var _i, _len, _ref, _results;
        _ref = this.nodes;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          node = _ref[_i];
          _results.push(node.to_code().split(/\n/).join("\n  "));
        }
        return _results;
      }).call(this)).join("\n  ");
    };

    Block.prototype.type = function() {
      return this.nodes[this.nodes.length - 1].type();
    };

    Block.prototype.compile = function(builder) {
      var last_result, node, _i, _len, _ref;
      this.debug("> " + this.to_code().split(/\n/).join("\n> "));
      last_result = null;
      _ref = this.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        last_result = node.compile(builder);
      }
      return last_result;
    };

    Block.prototype.push = function(node) {
      node.parent = this;
      this.nodes.push(node);
      if (this.root() instanceof Document) return node.run_prepare_blocks();
    };

    Block.prototype.concat = function(ary) {
      var node, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = ary.length; _i < _len; _i++) {
        node = ary[_i];
        _results.push(this.push(node));
      }
      return _results;
    };

    Block.prototype.nodes_matching = function(name) {
      var ary, node, _i, _len, _ref;
      ary = [];
      _ref = this.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        if (node.__proto__.constructor.name === name) ary.push(node);
      }
      return ary;
    };

    Block.wrap = function(nodes) {
      if (nodes.length === 1 && nodes[0] instanceof Block) return nodes[0];
      return new Block(nodes);
    };

    return Block;

  })(Base);

}).call(this);
