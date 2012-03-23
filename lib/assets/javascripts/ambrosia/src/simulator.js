(function() {
  var Builtins, CastValue, DefaultVariableValue, Expression, Literalize, Simulator, VariableValue, _ref,
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Builtins = require('builtins').Builtins;

  _ref = require('simulator/common'), DefaultVariableValue = _ref.DefaultVariableValue, CastValue = _ref.CastValue, VariableValue = _ref.VariableValue, Literalize = _ref.Literalize;

  Expression = require('simulator/expression').Expression;

  Literalize = require('simulator/common').Literalize;

  require('simulator/all_expressions');

  exports.Simulator = Simulator = (function() {
    var CARDS, KEYS, KEY_ALIASES;

    KEYS = "0 1 2 3 4 5 6 7 8 9 f1 f2 f3 f4 f5 f6 f7 f8 f9 up down menu stop enter cancel".split(/\s/);

    KEY_ALIASES = {
      f: 'menu'
    };

    CARDS = {};

    Simulator.register_card = function(name, values) {
      return CARDS[name.toLowerCase()] = values;
    };

    function Simulator(dom) {
      this.dom = dom;
      if (typeof this.dom === 'string') {
        this.dom = require('dom').build_dom_from(this.dom);
      }
      if (this.dom.name !== 'tml') throw new Error("TML builder required");
      this.recursion_depth = 0;
      this.max_recursion_depth = 10000;
      this.state = {
        key: "",
        card: null,
        flow: [],
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
      var display, match, print, screen, _base;
      if (match = /^tmlvar:(.*)$/.exec(id)) {
        id = id.replace(match[0], this.state.variables[match[1]].value);
      }
      if (id[0] === '#') id = id.slice(1);
      screen = this.dom.first("screen", {
        id: id
      });
      if (!screen) throw new Error("Screen '" + id + "' not found!");
      this.state.flow.push(["Switched to screen", screen.attrs.id]);
      this.state.screen.id = screen.attrs.id;
      this.state.screen.element = screen;
      this.process_variable_assignments();
      this.state.key = "";
      this.state.card = null;
      this.state.display = "";
      (_base = this.state).print || (_base.print = "");
      if (display = this.state.screen.element.first('display')) {
        this.state.flow.push(["Displayed output", display.toString(false)]);
        this.state.display = this.process_output_element(display);
      }
      if (print = this.state.screen.element.first('print')) {
        this.state.flow.push(["Printed output", print.toString(false)]);
        return this.state.print += this.process_output_element(print);
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

    Simulator.prototype.can_continue = function() {
      if (!(this.state.screen && this.state.screen.element)) return true;
      if (this.waiting_for_display()) return false;
      if (this.waiting_for_keypad()) return false;
      if (this.waiting_for_cardswipe()) return false;
      if (this.at_submit_screen()) return false;
      return true;
    };

    Simulator.prototype.is_waiting_for_input = function() {
      return !this.can_continue();
    };

    Simulator.prototype.waiting_for_display = function() {
      return this.state.screen.element.first('display') && !this.state.key;
    };

    Simulator.prototype.waiting_for_keypad = function() {
      var next, variant, _i, _len, _ref2;
      if (next = this.state.screen.element.first('next')) {
        _ref2 = next.all("variant");
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          variant = _ref2[_i];
          if (variant.attrs.key !== void 0) {
            return this.state.key === "" && this.state.card === null;
          }
        }
      }
      return false;
    };

    Simulator.prototype.waiting_for_cardswipe = function() {
      var card, tform;
      if (tform = this.state.screen.element.first('tform')) {
        if (card = tform.first('card')) {
          if (card.attrs.parser === 'mag' && card.attrs.parser_params === 'read_data') {
            return this.state.card === null && this.state.key === "";
          }
        }
      }
      return false;
    };

    Simulator.prototype.at_submit_screen = function() {
      return !!this.state.screen.element.first('submit');
    };

    Simulator.prototype.evaluate = function(variable, type, attrs) {
      this.state.flow.push(["Evaluated expression", [variable, type, attrs]]);
      variable.value = Expression.evaluate(type, attrs, this.state.variables);
      if (variable.type === 'integer') variable.value = parseInt(variable.value);
      return variable;
    };

    Simulator.prototype.find_variable = function(varname) {
      var variable, _base;
      variable = (_base = this.state.variables)[varname] || (_base[varname] = Builtins.descriptor_for(varname));
      if (!variable) throw new Error("Variable not defined: " + assign.attrs.name);
      return variable;
    };

    Simulator.prototype.process_variable_assignments = function() {
      var assign, match, submit, type, variable, varname, _i, _len, _ref2;
      _ref2 = this.state.screen.element.all('setvar');
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        assign = _ref2[_i];
        varname = assign.attrs.name;
        variable = this.find_variable(varname);
        type = variable.type;
        if (assign.attrs.lo && (match = /^tmlvar:(.*)$/.exec(assign.attrs.lo.toString()))) {
          if (this.state.variables[match[1]]) {
            type = this.state.variables[match[1]].type;
          }
        }
        this.evaluate(variable, type, assign.attrs);
      }
      if (submit = this.state.screen.element.first('submit')) {
        return this.process_form_submission(submit);
      }
    };

    Simulator.prototype.process_form_submission = function(submit_element) {
      var getvar, getvars, variable_name, _i, _len, _results;
      getvars = submit_element.all('getvar');
      this.state.post = {
        path: submit_element.attrs.tgt
      };
      this.state.flow.push(["Submitted form", this.state.post]);
      _results = [];
      for (_i = 0, _len = getvars.length; _i < _len; _i++) {
        getvar = getvars[_i];
        variable_name = getvar.attrs.name;
        _results.push(this.state.post[variable_name] = this.state.variables[variable_name].value);
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
            } else if (!this.state.card) {
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

    Simulator.prototype.enter = function(text, press_enter, field) {
      var char, found, type, variable, variant, _i, _len, _ref2;
      if (press_enter == null) press_enter = true;
      if (field == null) field = this.state.screen.element.search('input')[0];
      char = text.charAt(0);
      if (field) {
        variable = this.find_variable(field.attrs.name);
        type = 'string';
        this.evaluate(variable, type, {
          lo: "tmlvar:" + field.attrs.name,
          op: "plus",
          ro: char
        });
      } else {
        found = false;
        _ref2 = this.state.screen.element.search('variant');
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          variant = _ref2[_i];
          if (variant.attrs['key'] === char) found = true;
        }
        if (!found) {
          throw new Error("No handler for keypress '" + char + "' on this screen");
        }
        this.press(char);
      }
      if (text.length > 1) {
        return this.enter(text.substring(1, text.length), press_enter, field);
      } else {
        if (press_enter) return this.press('enter');
      }
    };

    Simulator.prototype.press = function(key) {
      var _ref2;
      if (KEY_ALIASES[key.toLowerCase()]) key = KEY_ALIASES[key.toLowerCase()];
      if (_ref2 = key.toLowerCase(), __indexOf.call(KEYS, _ref2) < 0) {
        throw new Error("Invalid key: '" + key + "'");
      }
      this.state.flow.push(["Pressed key", key]);
      this.state.key = key.toLowerCase();
      return this.start();
    };

    Simulator.prototype.follow = function(caption) {
      var match, target;
      match = new RegExp("<a([^>]+)>\\s*" + caption + "\\s*<\\/a>", "m").exec(this.state.display);
      if (!match) {
        throw new Error("No link visible with caption '" + caption + "'");
      }
      target = /href=['"]([^'"]*)['"]/.exec(match[1]);
      if (!target) {
        throw new Error("Anchor with caption '" + caption + "' has no href attribute");
      }
      this.goto(target[1]);
      return this.start();
    };

    Simulator.prototype.fill_in = function(field, content) {
      var rx;
      if (!this.state.variables[field]) {
        throw new Error("Variable " + field + " is not defined");
      }
      rx = new RegExp("<input [^>]*name=['\"]" + field + "[\"']", 'm');
      if (!rx.exec(this.state.display)) {
        throw new Error("Field " + field + " is not visible on this screen");
      }
      if (this.state.variables[field].type === 'integer') {
        content = parseInt(content);
      }
      this.state.flow.push(["Filled in", [field, content]]);
      return this.state.variables[field].value = content;
    };

    Simulator.prototype.swipe_card = function(name) {
      var key, parser, tform, value, _base, _name, _ref2;
      this.state.card = CARDS[name.toLowerCase()] || (function() {
        throw new Error("No registered card found with type " + name);
      })();
      this.state.flow.push(["Swiped card", name]);
      if (tform = this.state.screen.element.first('tform')) {
        if (parser = tform.first('card', {
          parser: "mag",
          parser_params: "read_data"
        })) {
          _ref2 = this.state.card;
          for (key in _ref2) {
            value = _ref2[key];
            (_base = this.state.variables)[_name = "card." + key] || (_base[_name] = Builtins.descriptor_for("card." + key));
            if (!this.state.variables["card." + key]) {
              throw new Error("No variable named card." + key);
            }
            this.state.variables["card." + key].value = value;
          }
          return this.start();
        }
      }
      throw new Error("No card parser found on screen " + this.state.screen.id);
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
          if (this.is_waiting_for_input()) return;
          this.step();
          if (this.is_waiting_for_input()) return;
          peeked = this.peek();
          if (peeked && peeked !== ("#" + this.start_screen.attrs.id)) {
            return this.resume(callback);
          }
        } catch (e) {
          if (e.message === "waiting for input") return;
          throw e;
        }
      }
    };

    return Simulator;

  })();

  Simulator.register_card("visa", {
    cardholder_name: "John Smith",
    effective_date: "01/01/2001",
    expiry_date: "01/01/2111",
    issue_number: "N/A",
    issuer_name: "N/A",
    pan: "4111111111111111",
    scheme: "VISA"
  });

}).call(this);
