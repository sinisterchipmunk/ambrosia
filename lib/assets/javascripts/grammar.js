(function() {
  var Parser, alt, alternatives, grammar, name, o, operators, token, tokens, unwrap;

  Parser = require("jison").Parser;

  unwrap = /^function\s*\(\)\s*\{\s*return\s*([\s\S]*);\s*\}/;

  o = function(patternString, action, options) {
    var match;
    patternString = patternString.replace(/\s{2,}/g, ' ');
    if (!action) return [patternString, '$$ = $1;', options];
    action = (match = unwrap.exec(action)) ? match[1] : "(" + action + "())";
    action = action.replace(/\bnew /g, '$&yy.');
    action = action.replace(/\b(?:Block\.wrap|extend)\b/g, 'yy.$&');
    return [patternString, "$$ = " + action + ";", options];
  };

  grammar = {
    Root: [
      o('Body', function() {
        return new Document(Block.wrap([new Method(new Identifier('__main__'), [], $1)]));
      }), o('', function() {
        return new Document(Block.wrap([new Method(new Identifier('__main__'), [], Block.wrap([]))]));
      })
    ],
    Method: [
      o('Identifier :', function() {
        return new Method($1, []);
      }), o('Identifier : Block', function() {
        return new Method($1, [], $3);
      }), o('Identifier : Line', function() {
        return new Method($1, [], Block.wrap([$3]));
      }), o('Identifier CALL_START ParamList CALL_END :', function() {
        return new Method($1, $3, new Block);
      }), o('Identifier CALL_START ParamList CALL_END : Block', function() {
        return new Method($1, $3, $6);
      }), o('Identifier CALL_START ParamList CALL_END : Line', function() {
        return new Method($1, $3, Block.wrap([$6]));
      })
    ],
    Identifier: [
      o('IDENTIFIER', function() {
        return new Identifier($1);
      }), o('. Identifier', function() {
        $2.name = "." + $2.name;
        return $2;
      }), o('Identifier . Identifier', function() {
        $1.name += "." + $3.name;
        return $1;
      })
    ],
    Line: [o('Method'), o('Expression'), o('Statement')],
    Body: [
      o('Line', function() {
        return Block.wrap([$1]);
      }), o('Body TERMINATOR Line', function() {
        $1.push($3);
        return $1;
      }), o('Body TERMINATOR', function() {
        return $1;
      })
    ],
    Block: [
      o('INDENT OUTDENT', function() {
        return new Block;
      }), o('INDENT Body OUTDENT', function() {
        return $2;
      })
    ],
    IfBlock: [
      o('IF Expression Block', function() {
        return new If($2, $3, $1);
      }), o('IfBlock ELSE IF Expression Block', function() {
        return $1.addElse(new If($4, $5, $3));
      })
    ],
    If: [
      o('IfBlock'), o('IfBlock ELSE Block', function() {
        return $1.addElse($3);
      }), o('Statement  POST_IF Expression', function() {
        return new If($3, Block.wrap([$1]), $2);
      }), o('Expression POST_IF Expression', function() {
        return new If($3, Block.wrap([$1]), $2);
      })
    ],
    Literal: [
      o('NUMBER', function() {
        return new Literal(eval($1));
      }), o('STRING', function() {
        return new Literal(eval($1));
      }), o('BOOL', function() {
        return new Literal(eval($1));
      })
    ],
    Value: [
      o('Literal', function() {
        return $1;
      }), o('Parenthetical', function() {
        return $1;
      })
    ],
    Expression: [
      o('Identifier', function() {
        return $1;
      }), o('ListIndex', function() {
        return $1;
      }), o('Value', function() {
        return $1;
      }), o(': Expression', function() {
        return new MethodReference($2);
      }), o('Assign'), o('MethodCall'), o('Operation'), o('ForIn', function() {
        return $1;
      }), o('ForOf', function() {
        return $1;
      }), o('Closure', function() {
        return $1;
      }), o('Range', function() {
        return $1;
      }), o('Array', function() {
        return $1;
      })
    ],
    ListIndex: [
      o('Identifier INDEX_START Expression INDEX_END', function() {
        return new ListIndex($1, $3);
      }), o('Identifier INDEX_START Expression .. Expression INDEX_END', function() {
        return new ListIndex($1, new Range($3, $5));
      }), o('Identifier INDEX_START Expression ... Expression INDEX_END', function() {
        return new ListIndex($1, new Range($3, $5, false));
      })
    ],
    Array: [
      o('[ ]', function() {
        return new Array([]);
      }), o('[ ArgList OptComma ]', function() {
        return new Array($2);
      })
    ],
    ArgList: [
      o('Arg', function() {
        return [$1];
      }), o('ArgList , Arg', function() {
        return $1.concat($3);
      }), o('ArgList OptComma TERMINATOR Arg', function() {
        return $1.concat($4);
      }), o('INDENT ArgList OptComma OUTDENT', function() {
        return $2;
      }), o('ArgList OptComma INDENT ArgList OptComma OUTDENT', function() {
        return $1.concat($4);
      })
    ],
    Arg: [o('Expression')],
    OptComma: [o(''), o(',')],
    Range: [
      o('[ Expression .. Expression ]', function() {
        return new Range($2, $4);
      }), o('[ Expression ... Expression ]', function() {
        return new Range($2, $4, false);
      })
    ],
    Closure: [
      o('-> Block', function() {
        return new Closure([], $2);
      }), o('PARAM_START ParamList PARAM_END -> Block', function() {
        return new Closure($2, $5);
      }), o('PARAM_START PARAM_END -> Block', function() {
        return new Closure([], $4);
      })
    ],
    Statement: [
      o('If', function() {
        return $1;
      }), o('Return', function() {
        return $1;
      }), o('Switch', function() {
        return $1;
      }), o('THROW Expression', function() {
        return new Throw($2);
      }), o('JS', function() {
        return new EmbeddedTML($1);
      })
    ],
    Switch: [
      o('SWITCH Expression INDENT Whens OUTDENT', function() {
        return new Switch($2, $4);
      }), o('SWITCH Expression INDENT Whens ELSE Block OUTDENT', function() {
        return new Switch($2, $4, $6);
      })
    ],
    Whens: [
      o('When'), o('Whens When', function() {
        return $1.concat($2);
      })
    ],
    When: [
      o('LEADING_WHEN Expression Block', function() {
        return [[$2, $3]];
      }), o('LEADING_WHEN Expression Block TERMINATOR', function() {
        return [[$2, $3]];
      })
    ],
    Return: [
      o('RETURN Expression', function() {
        return new Return($2);
      }), o('RETURN', function() {
        return new Return;
      })
    ],
    ForIn: [
      o('FOR Identifier FORIN Expression Block', function() {
        return new ForIn($2, $4, $5);
      })
    ],
    ForOf: [
      o('FOR Identifier FOROF Expression Block', function() {
        return new ForOf($2, $4, $5);
      })
    ],
    Parenthetical: [
      o('( Expression )', function() {
        return new Parens($2);
      }), o('( INDENT Expression OUTDENT )', function() {
        return new Parens($3);
      })
    ],
    MethodCall: [
      o('Identifier CALL_START ParamList CALL_END', function() {
        return new MethodCall($1, $3);
      }), o('Identifier CALL_START CALL_END', function() {
        return new MethodCall($1, []);
      })
    ],
    Operation: [
      o('- Expression', function() {
        return new Operation(new Literal(0), '-', $2);
      }), o('Identifier ++', function() {
        return new Assign($1, new Operation($1, '+', new Literal(1)));
      }), o('Identifier --', function() {
        return new Assign($1, new Operation($1, '-', new Literal(1)));
      }), o('Identifier COMPOUND_ASSIGN Expression', function() {
        return new Assign($1, new Operation($1, $2[0], $3));
      }), o('Expression MATH Expression', function() {
        return new Operation($1, $2, $3);
      }), o('Expression + Expression', function() {
        return new Operation($1, $2, $3);
      }), o('Expression - Expression', function() {
        return new Operation($1, $2, $3);
      }), o('Expression COMPARE Expression', function() {
        return new Operation($1, $2, $3);
      })
    ],
    Assign: [
      o('Identifier = Expression', function() {
        return new Assign($1, $3);
      }), o('Identifier = INDENT Expression OUTDENT', function() {
        return new Assign($1, $4);
      }), o('Identifier CALL_START = Expression CALL_END', function() {
        return new Assign($1, $5);
      })
    ],
    ParamList: [
      o('Param', function() {
        return [$1];
      }), o('ParamList , Param', function() {
        return $1.concat([$3]);
      })
    ],
    Param: [o('Expression')]
  };

  operators = [['left', '.', '?.', '::'], ['left', 'CALL_START', 'CALL_END'], ['nonassoc', '++', '--'], ['left', '?'], ['right', 'UNARY'], ['left', 'MATH'], ['left', '+', '-'], ['left', 'SHIFT'], ['left', 'RELATION'], ['left', 'COMPARE'], ['left', 'LOGIC'], ['nonassoc', 'INDENT', 'OUTDENT'], ['right', '=', ':', 'COMPOUND_ASSIGN', 'RETURN', 'THROW', 'EXTENDS'], ['right', 'FORIN', 'FOROF', 'BY', 'WHEN'], ['right', 'IF', 'ELSE', 'FOR', 'DO', 'WHILE', 'UNTIL', 'LOOP', 'SUPER', 'CLASS'], ['right', 'POST_IF']];

  tokens = [];

  for (name in grammar) {
    alternatives = grammar[name];
    grammar[name] = (function() {
      var _i, _j, _len, _len2, _ref, _results;
      _results = [];
      for (_i = 0, _len = alternatives.length; _i < _len; _i++) {
        alt = alternatives[_i];
        _ref = alt[0].split(' ');
        for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
          token = _ref[_j];
          if (!grammar[token]) tokens.push(token);
        }
        if (name === 'Root') alt[1] = "return " + alt[1];
        _results.push(alt);
      }
      return _results;
    })();
  }

  exports.parser = new Parser({
    tokens: tokens.join(' '),
    bnf: grammar,
    operators: operators.reverse(),
    startSymbol: 'Root'
  });

}).call(this);
