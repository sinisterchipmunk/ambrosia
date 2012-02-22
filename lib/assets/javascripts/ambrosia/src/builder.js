(function() {
  var Builder, TAB;

  TAB = "  ";

  exports.Builder = Builder = (function() {

    function Builder(name, attrs, inner, depth, parent) {
      this.name = name;
      this.attrs = attrs != null ? attrs : {};
      if (inner == null) inner = null;
      if (depth == null) depth = 0;
      this.parent = parent != null ? parent : null;
      if (!this.name) throw new Error("name of root tag is required");
      this.tags = [];
      this.depth = depth;
      this.root = (this.parent ? this.parent.root : this);
      if (!inner && this.attrs instanceof Function) {
        inner = this.attrs;
        this.attrs = {};
      }
      if (this.after_initialize) this.after_initialize();
      if (inner) inner(this);
    }

    Builder.prototype.remove = function(node_or_name, attrs) {
      var i, _ref, _results;
      if (attrs == null) attrs = {};
      if (typeof node_or_name === 'object') {
        attrs = node_or_name.attrs;
        node_or_name = node_or_name.name;
      }
      _results = [];
      for (i = 0, _ref = this.tags.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
        if (this.matches(this.tags[i], node_or_name, attrs)) {
          this.tags.splice(i, 1);
          this.remove(node_or_name, attrs);
          break;
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Builder.prototype.preamble = function() {
      return '<?xml version="1.0" encoding="ISO-8859-1"?>\n';
    };

    Builder.prototype.newInstance = function(name, attrs, inner) {
      var klass;
      klass = (Builder[name] ? Builder[name] : Builder);
      return new klass(name, attrs, inner, this.depth + 1, this);
    };

    Builder.prototype.b = function(name, attrs, inner) {
      var child;
      child = this.newInstance(name, attrs, inner);
      this.tags.push(child);
      return child;
    };

    Builder.prototype.insert = function(name, attrs, inner, sort) {
      var child, index;
      if (attrs && !sort) {
        if (attrs.before || attrs.after) {
          sort = attrs;
          attrs = {};
        }
      }
      if (typeof inner === 'object' && !sort) {
        sort = inner;
        inner = null;
      }
      child = this.newInstance(name, attrs, inner);
      if (sort.before) {
        if ((index = this.tags.indexOf(this.first(sort.before))) !== -1) {
          this.tags.splice(index, 0, child);
          return child;
        }
      }
      if (sort.after) {
        if ((index = this.tags.indexOf(this.last(sort.after))) !== -1) {
          this.tags.splice(index + 1, 0, child);
          return child;
        }
      }
      this.tags.push(child);
      return child;
    };

    Builder.prototype.search = function(name, attrs) {
      var all, tag, _i, _len, _ref;
      if (attrs == null) attrs = null;
      all = this.all(name, attrs);
      _ref = this.tags;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tag = _ref[_i];
        all = all.concat(tag.search(name, attrs));
      }
      return all;
    };

    Builder.prototype.first = function(name, attrs) {
      if (attrs == null) attrs = null;
      return this.all(name, attrs)[0];
    };

    Builder.prototype.last = function(name, attrs) {
      var all;
      if (attrs == null) attrs = null;
      all = this.all(name, attrs);
      return all[all.length - 1];
    };

    Builder.prototype.all = function(name, attrs) {
      var result, tag, _i, _len, _ref;
      if (attrs == null) attrs = null;
      result = [];
      _ref = this.tags;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tag = _ref[_i];
        if (this.matches(tag, name, attrs)) result.push(tag);
      }
      return result;
    };

    Builder.prototype.matches = function(tag, name, attrs) {
      var k, match, v;
      if (!name || tag.name.toLowerCase() === name.toLowerCase()) {
        if (attrs) {
          match = true;
          for (k in attrs) {
            v = attrs[k];
            if (tag.attrs[k] !== v) {
              match = false;
              break;
            }
          }
          if (match) return true;
        } else {
          return true;
        }
      }
      return false;
    };

    Builder.prototype.stringify = function() {
      var front, k, tag, v, _ref;
      if (this.name === '#text') {
        return this.tabs() + this.attrs.value.split(/\n/).join("\n" + (this.tabs())).trim();
      }
      front = "<" + this.name + " ";
      _ref = this.attrs;
      for (k in _ref) {
        v = _ref[k];
        front += "" + k + "=\"" + v + "\" ";
      }
      if (this.tags.length > 0) {
        return this.tabs() + front.trim() + ">\n" + ((function() {
          var _i, _len, _ref2, _results;
          _ref2 = this.tags;
          _results = [];
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            tag = _ref2[_i];
            _results.push(tag.toString(false) + "\n");
          }
          return _results;
        }).call(this)).join("") + this.tabs() + ("</" + this.name + ">");
      } else {
        return this.tabs() + front + "/>";
      }
    };

    Builder.prototype.tabs = function(depth) {
      var i, result;
      if (depth == null) depth = this.depth;
      result = "";
      for (i = 0; 0 <= depth ? i < depth : i > depth; 0 <= depth ? i++ : i--) {
        result += TAB;
      }
      return result;
    };

    Builder.prototype.toString = function(preamble) {
      if (preamble == null) preamble = true;
      return (preamble ? this.preamble() : "") + this.stringify();
    };

    return Builder;

  })();

}).call(this);
