(function() {
  var Lexer, fs, lexer, parser,
    __slice = Array.prototype.slice;

  fs = require('fs');

  global.$ = require('preprocessor_variables').$;

  exports.Simulator = require("simulator").Simulator;

  Lexer = require("lexer").Lexer;

  parser = require("parser").parser;

  require("extensions");

  lexer = new Lexer;

  parser.lexer = {
    lex: function() {
      var tag, _ref;
      _ref = this.tokens[this.pos++] || [''], tag = _ref[0], this.yytext = _ref[1], this.yylineno = _ref[2];
      return tag;
    },
    setInput: function(tokens) {
      this.tokens = tokens;
      return this.pos = 0;
    },
    upcomingInput: function() {
      return "";
    }
  };

  parser.yy = require('nodes');

  exports.parse = function(code) {
    return parser.parse(lexer.tokenize(code));
  };

  exports.compile = function(code) {
    if (code instanceof Object && code.compile) {
      return code.compile();
    } else {
      return exports.parse(code).compile();
    }
  };

  exports.compile_to_string = function(code) {
    return exports.compile(code).toString();
  };

  exports.compile_files = function() {
    var results, script, source_path, sources, tml_code, _i, _len;
    sources = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    results = {};
    for (_i = 0, _len = sources.length; _i < _len; _i++) {
      source_path = sources[_i];
      script = fs.readFileSync(source_path, 'UTF-8');
      tml_code = exports.compile(script);
      results[source_path] = tml_code;
    }
    return results;
  };

}).call(this);
