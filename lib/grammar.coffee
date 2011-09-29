{Parser} = require("jison")

# This DSL borrowed from CoffeeScript and twisted to suit our own maniacal means. :)
# See http://jashkenas.github.com/coffee-script/documentation/docs/grammar.html for the original.

unwrap = /^function\s*\(\)\s*\{\s*return\s*([\s\S]*);\s*\}/

o = (patternString, action, options) ->
  patternString = patternString.replace /\s{2,}/g, ' '
  return [patternString, '$$ = $1;', options] unless action
  action = if match = unwrap.exec action then match[1] else "(#{action}())"
  action = action.replace /\bnew /g, '$&yy.'
  action = action.replace /\b(?:Block\.wrap|extend)\b/g, 'yy.$&'
  [patternString, "$$ = #{action};", options]
  
grammar =
  Root: [
    o '', -> new Document new Block
    o '{ Methods }', -> new Document(Block.wrap $2)
  ]
  
  Method: [
    o 'Identifier :', -> new Method($1)
    o 'Identifier : Block', -> new Method($1, $3)
    o 'Identifier : Line', -> new Method($1, Block.wrap [$3])
    # o 'Identifier : Expression TERMINATOR', -> new Method($1, $3)
  ]

  Methods: [
    o 'Method', -> [$1]
    o 'Methods TERMINATOR Method', -> $1.concat [$3]
  ]
  
  Identifier: [
    o 'IDENTIFIER',                             -> new Literal $1
  ]

  # Any list of statements and expressions, separated by line breaks or semicolons.
  Body: [
    o 'Line',                                   -> Block.wrap [$1]
    o 'Body TERMINATOR Line',                   -> $1.push $3; $1
    o 'Body TERMINATOR',                        -> new Block
  ]
  
  # An indented block of expressions. Note that the [Rewriter](rewriter.html)
  # will convert some postfix forms into blocks for us, by adjusting the
  # token stream.
  Block: [
    o 'INDENT OUTDENT',                         -> new Block
    o 'INDENT Body OUTDENT',                    -> $2
  ]

  # Block and statements, which make up a line in a body.
  Line: [
    o 'Expression'
    o 'Statement'
  ]
  
  Expression: [
    o 'Value'
    o 'Assign'
    o 'MethodCall'
  ]
  
  Statement: [
    o 'RETURN Expression', -> new Return $2
  ]
  
  MethodCall: [
    o 'Identifier CALL_START ParamList CALL_END', -> new MethodCall $1, $3
    o 'Identifier CALL_START CALL_END', -> new MethodCall $1, []
  ]
  
  Value: [
    o 'Identifier', -> new Identifier($1)
    o 'NUMBER', -> new NumberValue(new Literal $1)
    o 'STRING', -> new StringValue(new Literal $1)
    o 'BOOL', -> new BoolValue(new Literal $1)
    o ': Identifier', -> new ScreenReference($2)
    # o 'JS', -> new Value($1)
    # o 'ARRAY', -> new Literal($1)
  ]
  
  Assign: [
    o 'Identifier = Expression', -> new Assign($1, $3)
    o 'Identifier = INDENT Expression OUTDENT', -> new Assign($1, $4)
    
    # this is produced by code `one = :one`
    o 'Identifier CALL_START { = Expression } CALL_END', -> new Assign($1, $5)
  ]
  
  ParamList: [
    o 'Param',             -> [ $1 ]
    o 'ParamList , Param', -> $1.concat [ $3 ]
  ]
  
  Param: [
    o 'Identifier'
  ]
  
operators = [
  ['left',      '.', '?.', '::']
  ['left',      'CALL_START', 'CALL_END']
  ['nonassoc',  '++', '--']
  ['left',      '?']
  ['right',     'UNARY']
  ['left',      'MATH']
  ['left',      '+', '-']
  ['left',      'SHIFT']
  ['left',      'RELATION']
  ['left',      'COMPARE']
  ['left',      'LOGIC']
  ['nonassoc',  'INDENT', 'OUTDENT']
  ['right',     '=', ':', 'COMPOUND_ASSIGN', 'RETURN', 'THROW', 'EXTENDS']
  ['right',     'FORIN', 'FOROF', 'BY', 'WHEN']
  ['right',     'IF', 'ELSE', 'FOR', 'DO', 'WHILE', 'UNTIL', 'LOOP', 'SUPER', 'CLASS']
  ['right',     'POST_IF']
]

tokens = []
for name, alternatives of grammar
  grammar[name] = for alt in alternatives
    for token in alt[0].split ' '
      tokens.push token unless grammar[token]
    alt[1] = "return #{alt[1]}" if name is 'Root'
    alt
    
exports.parser = new Parser
  tokens      : tokens.join ' '
  bnf         : grammar
  operators   : operators.reverse()
  startSymbol : 'Root'
  
# generate source, ready to be written to disk
# parserSource = exports.parser.generate()

