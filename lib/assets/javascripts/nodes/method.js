(function() {
  var Assign, Base, Block, Identifier, If, Literal, Method, MethodReference, Operation,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Base = require('nodes/base').Base;

  Block = require('nodes/block').Block;

  If = require('nodes/if').If;

  Identifier = require('nodes/identifier').Identifier;

  MethodReference = require('nodes/method_reference').MethodReference;

  Operation = require('nodes/operation').Operation;

  Literal = require('nodes/literal').Literal;

  Assign = require('nodes/assign').Assign;

  exports.Method = Method = (function(_super) {

    __extends(Method, _super);

    function Method() {
      Method.__super__.constructor.apply(this, arguments);
    }

    Method.prototype.children = function() {
      return ['name', 'params', 'block'];
    };

    Method.prototype.instance_name = function() {
      return Method.__super__.instance_name.apply(this, arguments) + ("<" + (this.getID()) + ">");
    };

    Method.prototype.to_code = function() {
      var code, param;
      code = "" + (this.getID()) + "(" + (((function() {
        var _i, _len, _ref, _results;
        _ref = this.params;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          param = _ref[_i];
          _results.push(param.to_code());
        }
        return _results;
      }).call(this)).join(', ')) + "):";
      if (this.block) {
        return "" + code + "\n" + (this.block.to_code());
      } else {
        return code;
      }
    };

    Method.prototype.after_initialize = function() {
      this.params || (this.params = []);
      if (this.name instanceof Identifier) this.name = this.name.name;
      if (this.getID() === '__main__') {
        return this.next = "#__main__";
      } else {
        return this.next = "#__return__";
      }
    };

    Method.prototype.getID = function() {
      this.id || (this.id = this.name);
      if (this.id) {
        return this.id;
      } else {
        throw new Error("Method needs a name");
      }
    };

    Method.prototype.type = function(params) {
      return this.current_scope().define('return', null).type();
    };

    Method.prototype.current_scope = function() {
      var id;
      if (this.scope) return this.scope;
      id = this.getID();
      this.scope = Method.__super__.current_scope.call(this);
      if (id !== '__main__') this.scope = this.scope.sub(id);
      return this.scope;
    };

    Method.prototype.getReturnVariable = function() {
      return this.current_scope().define("return");
    };

    Method.prototype.prepare = function() {
      var id, param, _i, _len, _ref, _results;
      id = this.getID();
      if (this.root().methods[id]) throw new Error("Duplicate method: " + id);
      this.root().methods[id] = this;
      this.current_scope().define(".__method_params", 'string');
      _ref = this.params;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        param = _ref[_i];
        _results.push(this.current_scope().define(param.name, null));
      }
      return _results;
    };

    Method.prototype.compile = function(builder) {
      var assigns, block, index, param, previous, screen, varname, _if, _ref, _true;
      if (this.compiled) {
        throw new Error("Already compiled method " + (this.getID()) + " (" + (this.node_tree()) + ")");
      } else {
        this.compiled = true;
      }
      previous = builder.root.current_screen() || {
        attrs: {
          id: "__main__"
        }
      };
      screen = builder.root.screen(this.getID());
      screen.attrs.next = this.next;
      if (this.getID() === '__main__') {
        this.create(Assign, this.create(Identifier, ".call.stack"), this.create(Literal, "")).compile(builder);
      }
      assigns = [];
      if (this.params.length > 0) {
        for (index = 0, _ref = this.params.length; 0 <= _ref ? index < _ref : index > _ref; 0 <= _ref ? index++ : index--) {
          param = this.params[index];
          varname = ".__generic_method_param_" + index;
          this.current_scope().silently_define(".__generic_method_param_" + index, 'string');
          assigns.push(this.create(Assign, this.create(Identifier, param.name), this.create(Identifier, varname)));
        }
        block = this.create(Block, assigns);
        _true = this.create(Literal, true);
        varname = this.create(Identifier, '.__generic_method');
        this.current_scope().define('.__generic_method');
        _if = this.create(If, this.create(Operation, varname, '==', _true), block);
        builder.root.current_screen();
        _if.compile(builder.root.current_screen()).toString();
        this.create(Assign, varname, this.create(Literal, false)).compile(builder.root.current_screen());
      }
      if (this.block) this.block.compile(builder.root.current_screen());
      builder.root.goto(previous.attrs.id);
      return this.create(MethodReference, new Literal(this.getID())).compile(builder);
    };

    return Method;

  })(Base);

}).call(this);
