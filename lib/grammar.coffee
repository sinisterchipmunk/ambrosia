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
    o 'Body',    -> new Document Block.wrap [new Method new Identifier('__main__'), [], $1]
    o '',        -> new Document Block.wrap [new Method new Identifier('__main__'), [], Block.wrap []]
  ]
  
  Method: [
    o 'Identifier :', -> new Method $1, []
    o 'Identifier : Block', -> new Method $1, [], $3
    o 'Identifier : Line', -> new Method $1, [], Block.wrap [$3]
    
    # init(a, b):
    o 'Identifier CALL_START ParamList CALL_END :', -> new Method $1, $3, new Block
    o 'Identifier CALL_START ParamList CALL_END : Block', -> new Method $1, $3, $6
    o 'Identifier CALL_START ParamList CALL_END : Line', -> new Method $1, $3, Block.wrap [$6]
  ]

  Identifier: [
    o 'IDENTIFIER',                             -> new Identifier $1
    o '. IDENTIFIER',                           -> new Identifier ".#{$2}"
    o 'Identifier . IDENTIFIER',                -> $1.name += "." + $3; $1
  ]

  # Block and statements, which make up a line in a body.
  Line: [
    o 'Method'
    o 'Expression'
    o 'Statement'
  ]
  
  # Any list of statements and expressions, separated by line breaks or semicolons.
  Body: [
    o 'Line',                                   -> Block.wrap [$1]
    o 'Body TERMINATOR Line',                   -> $1.push $3; $1
    o 'Body TERMINATOR',                        -> $1
  ]
  
  # An indented block of expressions. Note that the [Rewriter](rewriter.html)
  # will convert some postfix forms into blocks for us, by adjusting the
  # token stream.
  Block: [
    o 'INDENT OUTDENT',                         -> new Block
    o 'INDENT Body OUTDENT',                    -> $2
  ]
  
  # The most basic form of *if* is a condition and an action. The following
  # if-related rules are broken up along these lines in order to avoid
  # ambiguity.
  IfBlock: [
    o 'IF Expression Block',                    -> new If $2, $3, $1
    o 'IfBlock ELSE IF Expression Block',       -> $1.addElse new If $4, $5, $3
  ]

  # The full complement of *if* expressions, including postfix one-liner
  # *if* and *unless*.
  If: [
    o 'IfBlock'
    o 'IfBlock ELSE Block',                     -> $1.addElse $3
    o 'Statement  POST_IF Expression',          -> new If $3, Block.wrap([$1]), $2
    o 'Expression POST_IF Expression',          -> new If $3, Block.wrap([$1]), $2
  ]

  Literal: [
    o 'NUMBER', -> new Literal eval($1)
    o 'STRING', -> new Literal eval($1)
    o 'BOOL',   -> new Literal eval($1)
  ]
  
  Value: [
    o 'Literal', -> $1
    o 'Parenthetical', -> $1
  ]
  
  Expression: [
    o 'Identifier', -> $1
    o 'ListIndex', -> $1
    o 'Value', -> $1
    o ': Expression', -> new MethodReference $2
    o 'Assign'
    o 'MethodCall'
    o 'Operation'
    o 'ForIn', -> $1
    o 'ForOf', -> $1
    o 'Closure', -> $1
    o 'Range', -> $1
    # o 'Expression . Expression', -> new PropertyAccess $1, $3
  ]
  
  ListIndex: [
    o 'Identifier INDEX_START Expression INDEX_END', -> new ListIndex $1, $3
    o 'Identifier INDEX_START Expression .. Expression INDEX_END', -> new ListIndex $1, new Range $3, $5
    o 'Identifier INDEX_START Expression ... Expression INDEX_END', -> new ListIndex $1, new Range $3, $5, false
  ]
  
  Range: [
    o '[ Expression .. Expression ]', -> new Range $2, $4
    o '[ Expression ... Expression ]', -> new Range $2, $4, false
  ]
  
  Closure: [
    o '-> Block', -> new Closure [], $2
    o 'PARAM_START ParamList PARAM_END -> Block', -> new Closure $2, $5
    o 'PARAM_START PARAM_END -> Block', -> new Closure [], $4
  ]
  
  Statement: [
    o 'If', -> $1
    o 'Return', -> $1
    o 'Switch', -> $1
    o 'THROW Expression', -> new Throw $2
  ]
  
  Switch: [
    o 'SWITCH Expression INDENT Whens OUTDENT',            -> new Switch $2, $4
    o 'SWITCH Expression INDENT Whens ELSE Block OUTDENT', -> new Switch $2, $4, $6
    # o 'SWITCH INDENT Whens OUTDENT',                       -> new Switch null, $3
    # o 'SWITCH INDENT Whens ELSE Block OUTDENT',            -> new Switch null, $3, $5
  ]

  Whens: [
    o 'When'
    o 'Whens When',                             -> $1.concat $2
  ]

  # An individual **When** clause, with action.
  When: [
    o 'LEADING_WHEN Expression Block',            -> [[$2, $3]]
    o 'LEADING_WHEN Expression Block TERMINATOR', -> [[$2, $3]]
  ]
  
  Return: [
    o 'RETURN Expression', -> new Return $2
    o 'RETURN', -> new Return
  ]
  
  ForIn: [
    o 'FOR Identifier FORIN Expression Block', -> new ForIn $2, $4, $5
  ]
  
  ForOf: [
    o 'FOR Identifier FOROF Expression Block', -> new ForOf $2, $4, $5
  ]
  
  Parenthetical: [
    o '( Expression )', -> new Parens $2
    o '( INDENT Expression OUTDENT )', -> new Parens $3
  ]
  
  MethodCall: [
    o 'Identifier CALL_START ParamList CALL_END', -> new MethodCall $1, $3
    o 'Identifier CALL_START CALL_END', -> new MethodCall $1, []
  ]
  
  Operation: [
    o '- Expression', -> new Operation new Literal(0), '-', $2
    o 'Identifier ++', -> new Assign $1, new Operation $1, '+', new Literal 1
    o 'Identifier --', -> new Assign $1, new Operation $1, '-', new Literal 1
    o 'Identifier COMPOUND_ASSIGN Expression', -> new Assign $1, new Operation $1, $2[0], $3
    o 'Expression MATH Expression', -> new Operation $1, $2, $3
    o 'Expression + Expression', -> new Operation $1, $2, $3
    o 'Expression - Expression', -> new Operation $1, $2, $3
    o 'Expression COMPARE Expression', -> new Operation $1, $2, $3
  ]
  
  Assign: [
    o 'Identifier = Expression', -> new Assign($1, $3)
    o 'Identifier = INDENT Expression OUTDENT', -> new Assign($1, $4)
    
    # this is produced by code `one = :one`
    o 'Identifier CALL_START = Expression CALL_END', -> new Assign($1, $5)
  ]
  
  ParamList: [
    o 'Param',             -> [ $1 ]
    o 'ParamList , Param', -> $1.concat [ $3 ]
  ]
  
  Param: [
    o 'Expression'
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

