(function() {
  var CastValue, DefaultVariableValue, Expression, Literalize, Simulator, VariableValue, _ref,
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = require('simulator/common'), DefaultVariableValue = _ref.DefaultVariableValue, CastValue = _ref.CastValue, VariableValue = _ref.VariableValue, Literalize = _ref.Literalize;

  Expression = require('simulator/expression').Expression;

  Literalize = require('simulator/common').Literalize;

  require('simulator/all_expressions');

  exports.Simulator = Simulator = (function() {
    var KEYS;

    KEYS = "0 1 2 3 4 5 6 7 8 9 f1 f2 f3 f4 f5 f6 f7 f8 f9 up down menu stop enter cancel".split(/\s/);

    function Simulator(dom) {
      this.dom = dom;
      if (this.dom.name !== 'tml') throw new Error("TML builder required");
      this.recursion_depth = 0;
      this.max_recursion_depth = 10000;
      this.state = {
        screen: {
          id: null
        },
        variables: {}
      };
      this.init_variables();
      if (!(this.start_screen = this.dom.first("screen"))) {
        throw new Error("No screens found!");
      }
    }

    Simulator.prototype.init_variables = function() {
      var variable, _i, _len, _ref2, _results;
      _ref2 = this.dom.all("vardcl");
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        variable = _ref2[_i];
        _results.push(this.state.variables[variable.attrs.name] = {
          type: variable.attrs.type || "string",
          value: DefaultVariableValue(variable)
        });
      }
      return _results;
    };

    Simulator.prototype.goto = function(id) {
      var display, match, screen, _base;
      if (match = /^tmlvar:(.*)$/.exec(id)) {
        id = id.replace(match[0], this.state.variables[match[1]].value);
      }
      if (id[0] === '#') id = id.slice(1);
      screen = this.dom.first("screen", {
        id: id
      });
      if (!screen) throw new Error("Screen '" + id + "' not found!");
      this.state.screen.id = screen.attrs.id;
      this.state.screen.element = screen;
      this.process_variable_assignments();
      this.state.key = "";
      this.state.display = "";
      (_base = this.state).print || (_base.print = "");
      if (display = this.state.screen.element.first('display')) {
        return this.state.display = this.process_output_element(display);
      }
    };

    Simulator.prototype.process_output_element = function(e) {
      var attr, attrs, key, match, result, str, sub, value, variable, _i, _len, _ref2, _ref3;
      str = "" + ((function() {
        var _i, _len, _ref2, _results;
        _ref2 = e.all();
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          sub = _ref2[_i];
          _results.push(sub.toString(false));
        }
        return _results;
      })());
      while (match = /<getvar(.*?)\/?\s*>/.exec(str)) {
        attrs = {};
        _ref2 = match[1].trim().split(' ');
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          attr = _ref2[_i];
          _ref3 = attr.split('='), key = _ref3[0], value = _ref3[1];
          attrs[key] = value.slice(1, -1);
        }
        variable = this.state.variables[attrs['name']];
        result = variable.value;
        str = str.replace(match[0], result);
      }
      return str;
    };

    Simulator.prototype.is_waiting_for_input = function() {
      var card, next, scr, tform, variant, _i, _len, _ref2;
      scr = this.state.screen.element;
      if (scr.first('display')) return true;
      next = this.state.screen.element.first('next');
      if (next) {
        _ref2 = next.all("variant");
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          variant = _ref2[_i];
          if (variant.attrs['key']) if (!this.state.key) return true;
        }
      }
      if (tform = this.state.screen.element.first('tform')) {
        if (card = tform.first('card')) {
          if (card.attrs['parser'] === 'mag' && card.attrs['parser_params'] === 'read_data') {
            return true;
          }
        }
      }
      return false;
    };

    Simulator.prototype.process_variable_assignments = function() {
      var assign, match, type, variable, _i, _len, _ref2, _results;
      _ref2 = this.state.screen.element.all('setvar');
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        assign = _ref2[_i];
        variable = this.state.variables[assign.attrs.name];
        if (!variable) {
          throw new Error("Variable not defined: " + assign.attrs.name);
        }
        type = variable.type;
        if (assign.attrs.lo && (match = /^tmlvar:(.*)$/.exec(assign.attrs.lo.toString()))) {
          if (this.state.variables[match[1]]) {
            type = this.state.variables[match[1]].type;
          }
        }
        variable.value = Expression.evaluate(type, assign.attrs, this.state.variables);
        if (variable.type === 'integer') {
          _results.push(variable.value = parseInt(variable.value));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Simulator.prototype.step = function() {
      if (!this.state.screen.element) {
        return this.goto(this.start_screen.attrs.id);
      } else {
        if (++this.recursion_depth > this.max_recursion_depth) {
          throw new Error("Recursion error!");
        }
        return this.process_variants();
      }
    };

    Simulator.prototype.find_possible_variants = function() {
      var candidate, candidates, next, result, variant, _i, _len, _ref2;
      candidates = [];
      next = this.state.screen.element.first('next');
      if (next) {
        _ref2 = next.all("variant");
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          variant = _ref2[_i];
          if (variant.attrs['key']) {
            if (this.state.key) {
              if (this.state.key === variant.attrs['key']) {
                return [variant.attrs['uri']];
              }
            } else {
              throw new Error("waiting for input");
            }
          } else {
            result = Expression.evaluate("boolean", variant.attrs, this.state.variables);
            if (result) candidates.push(variant.attrs['uri']);
          }
        }
      }
      next = (next && next.attrs['uri']) || this.state.screen.element.attrs['next'];
      if (next) candidates.push(next);
      candidates = (function() {
        var _j, _len2, _results;
        _results = [];
        for (_j = 0, _len2 = candidates.length; _j < _len2; _j++) {
          candidate = candidates[_j];
          if (/^tmlvar:/.test(candidate)) {
            _results.push(Literalize(this.state.variables, candidate, 'string'));
          } else {
            _results.push(candidate);
          }
        }
        return _results;
      }).call(this);
      return candidates;
    };

    Simulator.prototype.process_variants = function() {
      var candidates;
      candidates = this.find_possible_variants();
      if (candidates.length === 0) {} else {
        return this.goto(candidates[0]);
      }
    };

    Simulator.prototype.start = function(callback) {
      return this.resume(callback);
    };

    Simulator.prototype.press = function(key) {
      if (__indexOf.call(KEYS, key) < 0) {
        throw new Error("Invalid key: '" + key + "'");
      }
      this.state.key = key;
      return this.start();
    };

    Simulator.prototype.peek = function() {
      return this.find_possible_variants()[0];
    };

    Simulator.prototype.resume = function(callback) {
      var peeked;
      this.recursion_depth = 0;
      if (callback) {
        this.step();
        if (callback(this) && this.peek()) return this.resume(callback);
      } else {
        try {
          this.step();
          if (this.is_waiting_for_input()) return;
          peeked = this.peek();
          if (peeked && peeked !== ("#" + this.start_screen.attrs.id)) {
            return this.resume(callback);
          }
        } catch (e) {
          if (e.message === "waiting for input") {} else {
            throw e;
          }
        }
      }
    };

    return Simulator;

  })();

}).call(this);
