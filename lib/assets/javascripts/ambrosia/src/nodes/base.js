(function() {
  var Base,
    __slice = Array.prototype.slice;

  exports.Base = Base = (function() {

    Base.prototype.debug = function(mesg) {
      if (process.env['DEBUG']) return console.log(mesg);
    };

    function Base() {
      var children, index, node, nodes, self, _ref;
      nodes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this.nodes = nodes;
      nodes = this.nodes;
      self = this;
      if (this.children) children = this.children();
      for (index = 0, _ref = nodes.length; 0 <= _ref ? index < _ref : index > _ref; 0 <= _ref ? index++ : index--) {
        node = nodes[index];
        this.setParent(node, self);
        if (children && children[index] !== void 0) self[children[index]] = node;
      }
      if (this.after_initialize) this.after_initialize();
    }

    Base.prototype.setParent = function(node, p) {
      var n, _i, _len, _results;
      node.parent = p;
      if (node instanceof Array) {
        _results = [];
        for (_i = 0, _len = node.length; _i < _len; _i++) {
          n = node[_i];
          _results.push(this.setParent(n, p));
        }
        return _results;
      }
    };

    Base.prototype.indent = function(str) {
      if (str instanceof Base) str = str.to_code();
      return "  " + str.split(/\n/).join("\n  ");
    };

    Base.prototype.create = function() {
      var args, child, klass;
      klass = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      child = (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return typeof result === "object" ? result : child;
      })(klass, args, function() {});
      child.parent = this;
      child.run_prepare_blocks();
      return child;
    };

    Base.prototype.run_prepare_blocks = function() {
      var node, _i, _len, _ref, _results;
      if (this.prepared) return;
      this.prepared = true;
      if (this.prepare) this.prepare();
      _ref = this.nodes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        if (node instanceof Base) {
          _results.push(node.run_prepare_blocks());
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Base.prototype.depth = function() {
      var depth, p;
      depth = 0;
      p = this;
      while (p = p.parent) {
        depth++;
      }
      return depth;
    };

    Base.prototype.children = function() {
      return [];
    };

    Base.prototype.compile = function() {
      throw new Error("no compiler for node");
    };

    Base.prototype.type = function() {
      throw new Error("node has no type");
    };

    Base.prototype.instance_name = function() {
      return this.__proto__.constructor.name;
    };

    Base.prototype.node_tree = function() {
      if (this.parent) {
        return this.parent.node_tree() + "::" + this.instance_name();
      } else {
        return this.instance_name();
      }
    };

    Base.prototype.current_scope = function() {
      var match;
      if (this.scope) return this.scope;
      try {
        if (this.parent) return this.parent.current_scope();
      } catch (e) {
        if (match = /BUG: No scope! \(in (.*)\)$/.exec(e.toString())) {
          throw new Error("BUG: No scope in parent<" + match[1] + "> (reraised by " + (this.node_tree()) + ")");
        } else {
          throw e;
        }
      }
      throw new Error("BUG: No scope! (in " + (this.node_tree()) + ")");
    };

    Base.prototype.root = function() {
      var p, parent;
      p = this;
      while (p) {
        parent = p;
        p = p.parent;
      }
      return parent;
    };

    return Base;

  })();

}).call(this);
