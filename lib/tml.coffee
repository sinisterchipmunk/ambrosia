# This DSL borrowed from CoffeeScript and twisted to suit our own maniacal means. :)
# See http://jashkenas.github.com/coffee-script/documentation/docs/grammar.html for the original.

exports.Simulator = require("./simulator").Simulator
{Lexer} = require("./lexer")
parser = require("./grammar").parser

lexer = new Lexer

# The real Lexer produces a generic stream of tokens. This object provides a
# thin wrapper around it, compatible with the Jison API. We can then pass it
# directly as a "Jison lexer".
parser.lexer =
  lex: ->
    [tag, @yytext, @yylineno] = @tokens[@pos++] or ['']
    tag
  setInput: (@tokens) ->
    @pos = 0
  upcomingInput: ->
    ""
    
parser.yy = require './nodes'

exports.parse = (code) -> parser.parse(lexer.tokenize code)

exports.compile = (code) ->
  if code instanceof Object and code.compile
    code.compile()
  else
    exports.parse(code).compile()
