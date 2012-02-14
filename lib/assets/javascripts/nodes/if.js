(function() {
  var Base, If, Operation,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Base = require('nodes/base').Base;

  Operation = require('nodes/operation').Operation;

  exports.If = If = (function(_super) {

    __extends(If, _super);

    function If() {
      If.__super__.constructor.apply(this, arguments);
    }

    If.prototype.to_code = function() {
      return "if " + (this.expression.to_code()) + "\n" + (this.block.to_code()) + (this.else_block ? "\nelse\n" + (this.else_block.to_code()) : "");
    };

    If.prototype.children = function() {
      return ['expression', 'block', 'if_type'];
    };

    If.prototype.type = function() {
      return this.block.type() || this.else_block.type();
    };

    If.prototype.addElse = function(block) {
      this.else_block = block;
      this.else_block.parent = this;
      return this;
    };

    If.prototype.compile = function(builder) {
      var if_screen, op, screen;
      if (this.expression instanceof Operation) {
        op = this.expression;
      } else {
        if (this.expression.type() === 'integer') {
          op = this.create(Operation, this.expression, "not_equal", "0");
        } else {
          op = this.create(Operation, this.expression, "not_equal", "");
        }
      }
      screen = if_screen = builder.root.current_screen();
      screen = screen.branch(op.compile(screen));
      this.block.compile(screen);
      if (this.else_block) {
        if (this.else_block.nodes.length === 1 && this.else_block.nodes[0] instanceof If) {
          builder.root.goto(if_screen.attrs.id);
          this.else_block.compile(if_screen);
        } else {
          screen = screen.branch_else();
          this.else_block.compile(screen);
        }
      }
      return screen.branch_merge();
    };

    return If;

  })(Base);

}).call(this);
