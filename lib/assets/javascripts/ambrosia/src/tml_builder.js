(function() {
  var Builder, NameRegistry, Screen, TMLBuilder, uri_for,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Builder = require('builder').Builder;

  uri_for = function(path) {
    if (/^tmlvar:/.test(path)) {
      return path;
    } else {
      return "#" + path;
    }
  };

  exports.NameRegistry = NameRegistry = (function() {
    var validate;

    validate = function(m) {
      if (m.length > 32) {
        throw new Error("ID " + m + " exceeds maximum 32 characters!");
      }
      return m;
    };

    function NameRegistry() {
      this.unique_id = 0;
      this.registry = {};
      this.counters = {};
    }

    NameRegistry.prototype.register = function(name) {
      var _base;
      return (_base = this.registry)[name] || (_base[name] = this.unique_id++);
    };

    NameRegistry.prototype.increment = function(name) {
      var _base;
      (_base = this.counters)[name] || (_base[name] = 0);
      return validate(name + "_" + this.counters[name]++);
    };

    return NameRegistry;

  })();

  Builder.screen = Screen = (function(_super) {

    __extends(Screen, _super);

    function Screen() {
      Screen.__super__.constructor.apply(this, arguments);
    }

    Screen.prototype.extend = function() {
      var new_id, next, next_screen, variants;
      this.source_id || (this.source_id = this.attrs.id);
      new_id = this.root.name_registry.increment(this.source_id);
      next_screen = this.root.screen(new_id);
      next_screen.source_id = this.source_id;
      if (next = this.first('next')) variants = next.all('variant');
      next = next_screen.b('next', {
        uri: this.next().attrs.uri
      }, function(b) {
        var v, _i, _len, _results;
        if (variants) {
          _results = [];
          for (_i = 0, _len = variants.length; _i < _len; _i++) {
            v = variants[_i];
            _results.push(b.b('variant', v.attrs));
          }
          return _results;
        }
      });
      this.remove('next');
      this.attrs.next = '#' + next_screen.attrs.id;
      return next_screen;
    };

    Screen.prototype.is_wait_screen = function() {
      if (this.first('display' || this.first('print'))) return true;
      return false;
    };

    Screen.prototype.variants = function() {
      var next;
      if (next = this.first('next')) {
        return next.all('variant');
      } else {
        return [];
      }
    };

    Screen.prototype.next = function() {
      return this.first('next') || {
        attrs: {
          uri: this.attrs.next
        }
      };
    };

    Screen.prototype.b = function() {
      var result;
      result = Screen.__super__.b.apply(this, arguments);
      if (this.first('next')) delete this.attrs.next;
      return result;
    };

    Screen.prototype.branch = function(operation) {
      var base_id, new_screen_id, new_screen_uri, next, scr;
      if (!(next = this.first('next'))) {
        next = this.b('next', {
          uri: this.attrs.next
        });
      }
      this.merge_to = this.root.screen(this.attrs.id + "_merge", {
        next: next.attrs.uri
      });
      next.attrs.uri = "#" + this.merge_to.attrs.id;
      if (operation.key) {
        base_id = this.attrs.id + "_key";
      } else {
        base_id = this.attrs.id + "_if";
      }
      new_screen_id = this.root.name_registry.increment(base_id);
      new_screen_uri = uri_for(new_screen_id);
      operation.uri = new_screen_uri;
      next.b('variant', operation);
      scr = this.root.screen(new_screen_id, {
        next: next.attrs.uri
      });
      scr._branched_from = this;
      scr.merge_to = this.merge_to;
      return scr;
    };

    Screen.prototype.branch_else = function() {
      var new_screen_id, scr;
      new_screen_id = this._branched_from.attrs.id + "_else";
      scr = this.root.screen(new_screen_id, {
        next: this._branched_from.next().attrs.uri
      });
      scr.merge_to = this._branched_from.merge_to;
      this._branched_from.next().attrs.uri = "#" + new_screen_id;
      return scr;
    };

    Screen.prototype.branch_merge = function() {
      this.root.goto(this.merge_to.attrs.id);
      return this.merge_to;
    };

    Screen.prototype.call_method = function(name, return_target, push_stack) {
      var method_uri, next, next_uri, return_target_uri;
      if (push_stack == null) push_stack = true;
      return_target_uri = uri_for(return_target);
      method_uri = uri_for(name);
      next_uri = this.next().attrs.uri;
      this.root.add_return_screen();
      next = this.first('next') || this.b('next');
      next.attrs.uri = method_uri;
      if (push_stack) {
        this.b('setvar', {
          name: 'call.stack',
          lo: ";",
          op: "plus",
          ro: "tmlvar:call.stack"
        });
        this.b('setvar', {
          name: 'call.stack',
          lo: "" + return_target_uri,
          op: "plus",
          ro: "tmlvar:call.stack"
        });
      }
      return this.root.screen(return_target, {
        next: next_uri
      });
    };

    return Screen;

  })(Builder);

  exports.TMLBuilder = TMLBuilder = (function(_super) {

    __extends(TMLBuilder, _super);

    function TMLBuilder() {
      this.name_registry = new NameRegistry;
      TMLBuilder.__super__.constructor.call(this, 'tml', {
        xmlns: "http://www.ingenico.co.uk/tml",
        cache: "deny"
      });
      this.b('head', function(b) {
        return b.b('defaults', {
          cancel: 'emb://embedded.tml'
        });
      });
      this.screen('__main__', {
        next: "#main"
      });
    }

    TMLBuilder.prototype.vardcl = function(name, type, value) {
      var attrs, vari;
      if (type == null) type = "string";
      if (value == null) value = null;
      if ((vari = this.first("vardcl", {
        name: name
      }))) {
        vari.attrs.type = type;
        return;
      }
      attrs = {
        name: name,
        type: 'string'
      };
      if (type) attrs.type = type;
      if (value) attrs.value = value;
      return this.insert('vardcl', attrs, {
        before: 'screen'
      });
    };

    TMLBuilder.prototype.screen = function(id, attrs, inner) {
      var i, scr, _base, _i, _len;
      if (id == null) id = null;
      if (attrs == null) attrs = {};
      if (inner == null) inner = null;
      if (typeof id === 'object') {
        throw new Error("expected screen ID, got " + (JSON.stringify(id)));
      }
      if (typeof attrs === "function") {
        inner = attrs;
        attrs = {};
      }
      if (id) {
        if (id.length > 32) {
          throw new Error("ID '" + id + "' exceeds 32 characters");
        }
        attrs.id = id;
        this._current_screen = id;
      }
      attrs.next || (attrs.next = "#__return__");
      if (attrs.id && (scr = this.first("screen", {
        id: id
      }))) {
        for (_i = 0, _len = attrs.length; _i < _len; _i++) {
          i = attrs[_i];
          (_base = scr.attrs)[i] || (_base[i] = attrs[i]);
        }
        return scr;
      } else {
        return this.insert('screen', attrs, inner, {
          after: 'screen'
        });
      }
    };

    TMLBuilder.prototype.current_screen = function() {
      return this.root.first('screen', {
        id: this._current_screen
      });
    };

    TMLBuilder.prototype.goto = function(screen_id) {
      if (screen_id.attrs) {
        return this._current_screen = screen_id.attrs.id;
      } else {
        return this._current_screen = screen_id;
      }
    };

    TMLBuilder.prototype.add_return_screen = function() {
      var main;
      if (this.first("screen", {
        id: '__return__'
      }) !== void 0) {
        return;
      }
      this.vardcl('call.stack_shift', 'string');
      main = this.first("screen", {
        id: "__main__"
      });
      main.b('setvar', {
        name: 'call.stack',
        lo: ''
      });
      this.screen('__return__', function(ret) {
        ret.b('next', {
          uri: '#__shift_char__'
        }, function(nxt) {
          return nxt.b('variant', {
            uri: '#__main__',
            lo: 'tmlvar:call.stack_shift',
            op: 'equal',
            ro: ''
          });
        });
        return ret.b('setvar', {
          name: 'call.stack_shift',
          lo: 'tmlvar:call.stack',
          op: 'item',
          ro: '0'
        });
      });
      this.screen('__shift_char__', function(shi) {
        shi.b('next', {
          uri: '#__shift_char__'
        }, function(nxt) {
          return nxt.b('variant', {
            uri: '#__shift_last__',
            lo: 'tmlvar:call.stack',
            op: 'equal',
            ro: ';',
            format: 'c'
          });
        });
        return shi.b('setvar', {
          name: 'call.stack',
          lo: 'tmlvar:call.stack',
          op: 'minus',
          ro: '-1'
        });
      });
      return this.screen('__shift_last__', function(shi) {
        shi.b('next', {
          uri: 'tmlvar:call.stack_shift'
        });
        return shi.b('setvar', {
          name: 'call.stack',
          lo: 'tmlvar:call.stack',
          op: 'minus',
          ro: '-1'
        });
      });
    };

    return TMLBuilder;

  })(Builder);

}).call(this);
