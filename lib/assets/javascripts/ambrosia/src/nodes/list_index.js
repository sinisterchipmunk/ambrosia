(function() {
  var Assign, Block, Extension, ForIn, Identifier, ListIndex, Literal, Operation, Range,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Extension = require('nodes/extension').Extension;

  Operation = require('nodes/operation').Operation;

  Range = require('nodes/range').Range;

  Identifier = require('nodes/identifier').Identifier;

  Assign = require('nodes/assign').Assign;

  Literal = require('nodes/literal').Literal;

  ForIn = require('nodes/for_in').ForIn;

  Block = require('nodes/block').Block;

  exports.ListIndex = ListIndex = (function(_super) {

    __extends(ListIndex, _super);

    function ListIndex() {
      ListIndex.__super__.constructor.apply(this, arguments);
    }

    ListIndex.prototype.type = function() {
      return 'string';
    };

    ListIndex.prototype.children = function() {
      return ['list', 'index'];
    };

    ListIndex.prototype.to_code = function() {
      if (this.index instanceof Range) {
        return "" + (this.list.to_code()) + "[" + (this.index.to_code()) + "]";
      } else {
        return "" + (this.list.to_code()) + (this.index.to_code());
      }
    };

    ListIndex.prototype.compile = function(b) {
      if (this.index instanceof Range) {
        this.require(b, 'std/list_index');
        return this.invoke(b, "list_index", this.list, this.index.start, this.index.stop);
      } else {
        return this.create(Operation, this.list, 'item', this.index).compile(b);
      }
    };

    return ListIndex;

  })(Extension);

}).call(this);
