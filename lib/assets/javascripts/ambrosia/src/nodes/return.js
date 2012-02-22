(function() {
  var Assign, Base, Identifier, Literal, Return,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Base = require('nodes/base').Base;

  Identifier = require('nodes/identifier').Identifier;

  Literal = require('nodes/literal').Literal;

  Assign = require('nodes/assign').Assign;

  exports.Return = Return = (function(_super) {

    __extends(Return, _super);

    function Return() {
      Return.__super__.constructor.apply(this, arguments);
    }

    Return.prototype.children = function() {
      return ['expression'];
    };

    Return.prototype.to_code = function() {
      return "return " + (this.expression ? this.expression.to_code() : "");
    };

    Return.prototype.type = function() {
      if (this.expression) {
        return this.expression.type();
      } else {
        return null;
      }
    };

    Return.prototype["with"] = function(expr) {
      this.expression = expr;
      this.expression.parent = this;
      return this;
    };

    Return.prototype.compile = function(builder) {
      var assignment, current, dependent, next, screen_id, type, v;
      screen_id = builder.attrs.id;
      this.expression || (this.expression = this.create(Literal, ""));
      assignment = this.create(Assign, this.create(Identifier, "return"), this.expression).compile(builder);
      if (type = this.expression.type()) {
        v = this.current_scope().define("return", this.expression.type());
      } else {
        v = this.current_scope().define("return");
        dependent = this.expression.get_dependent_variable();
        v.depends_upon(dependent);
      }
      current = builder.root.current_screen();
      if (current.attrs['id'] !== '__main__') {
        if (next = current.first('next')) {
          next.attrs.uri = '#__return__';
        } else {
          current.attrs.next = '#__return__';
        }
      }
      return assignment;
    };

    return Return;

  })(Base);

}).call(this);
