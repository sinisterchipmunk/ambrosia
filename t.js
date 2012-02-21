(function(program, execJS) { execJS(program) })(function(module, exports, require) { (function(global) {
  if (typeof(window) != 'undefined')
    window.global = global;
  
  var Ambrosia = (function() {
    var process = {
      env: {
        AMBROSIA_STDLIB_PATH: 'stdlib',
        AMBROSIA_FILE_EXT: '.tml.ambrosia',
        AMBROSIA_VIEW_PATH: 'views'
      },
      
      cwd: function() { return "" }
    };
    
    var _require = {};
    require = function(path) { return require[path] = require[path] || _require[path] && _require[path](); };
    
    _require['path'] = function() {
      return {
        join: function() {
          var path = ""
          for (var i = 0; i < arguments.length; i++)
            if (arguments[i] != "")
              path += "/" + arguments[i];
          return path;
        },
        
        basename: function(path) {
          var split = path.split(/[\\\/]/);
          return split[split.length-1];
        },
        
        normalize: function(path) {
          var split = path.split(/[\\\/]/);
          var normalized = [];
          for (var i = 0; i < split.length; i++) {
            if (split[i] == '.' || split[i] == '') continue;
            if (split[i] == '..') normalized.pop();
            else normalized.push(split[i]);
          }
          return normalized.join('/');
        },
        
        extname: function(path) {
          var name = require('path').basename(path);
          if (name.indexOf('.') > 0) 
            return name.substring(name.indexOf('.')+1, name.length);
          else
            return '';
        }
      };
    };

    
    _require['builder'] = (function() {
      var exports = this;
      _require['builder'] = function() { return exports; };
      var __dirname = './.';
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

      return exports;
    });
    
    _require['cli'] = (function() {
      var exports = this;
      _require['cli'] = function() { return exports; };
      var __dirname = './.';
      (function() {
  var CLI, Simulator, fs, tml,
    __slice = Array.prototype.slice;

  fs = require('fs');

  tml = require('tml');

  Simulator = require("simulator").Simulator;

  exports.CLI = CLI = (function() {

    function CLI() {}

    CLI.prototype.exec = function(script) {
      var dom, sim;
      dom = tml.parse(script).compileDOM();
      sim = new Simulator(dom);
      sim.start();
      return console.log(sim.state.variables["return"].value);
    };

    CLI.prototype.compile_script = function(script) {
      return console.log(tml.compile(script).toString());
    };

    CLI.prototype.compile = function() {
      var dom, filename, match, results, sources, _results;
      sources = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      results = tml.compile_files.apply(tml, sources);
      _results = [];
      for (filename in results) {
        dom = results[filename];
        if (sources.length === 1) {
          _results.push(console.log(dom.toString()));
        } else {
          if (match = /^(.*)\.([^\.]*)$/.exec(filename)) filename = match[1];
          filename += ".tml";
          _results.push(fs.writeFile(filename, dom.toString(), function(err) {
            if (err) throw err;
            return console.log("(Wrote file " + filename + ")");
          }));
        }
      }
      return _results;
    };

    return CLI;

  })();

}).call(this);

      return exports;
    });
    
    _require['dom'] = (function() {
      var exports = this;
      _require['dom'] = function() { return exports; };
      var __dirname = './.';
      (function() {
  var jsdom;

  jsdom = require('jsdom');

  exports.create_dom = function(code) {
    var div;
    if (jsdom) {
      div = jsdom.jsdom("<div>" + code + "</div>").childNodes[0];
    } else {
      div = document.createElement('div');
      div.innerHTML = code;
    }
    return div.childNodes;
  };

}).call(this);

      return exports;
    });
    
    _require['ext/display'] = (function() {
      var exports = this;
      _require['ext/display'] = function() { return exports; };
      var __dirname = './ext';
      (function() {
  var Assign, Document, Literal, ViewTemplate, create_dom,
    __slice = Array.prototype.slice;

  Document = require('nodes/document').Document;

  Literal = require('nodes/literal').Literal;

  Assign = require('nodes/assign').Assign;

  ViewTemplate = require('view_template').ViewTemplate;

  create_dom = require('dom').create_dom;

  Document.preprocessor('display', function() {
    var builder, dom, filename, filenames, layout, screen, template, traverse, _i, _len;
    builder = arguments[0], filenames = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    for (_i = 0, _len = filenames.length; _i < _len; _i++) {
      filename = filenames[_i];
      template = ViewTemplate.find(filename);
      if (layout = this.root().layout) {
        this.root().current_template = template;
        dom = create_dom(layout.process(this, builder));
        this.root().current_template = null;
      } else {
        dom = create_dom(template.process(this, builder));
      }
      screen = builder.current_screen();
      if (screen.is_wait_screen()) screen = screen.extend();
      traverse = function(b) {
        var attr, attrs, name, node, value, _j, _k, _len2, _len3, _ref, _ref2;
        _ref = b.attrs.dom_nodes;
        for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
          node = _ref[_j];
          attrs = {
            dom_nodes: node.childNodes
          };
          if (node.attributes) {
            _ref2 = node.attributes;
            for (_k = 0, _len3 = _ref2.length; _k < _len3; _k++) {
              attr = _ref2[_k];
              name = attr.name;
              value = attr.value;
              attrs[name] = value;
            }
          }
          if (node.nodeName === '#text') {
            attrs.value = node.nodeValue.trim();
            if (attrs.value === "") continue;
          }
          b.b(node.nodeName.toLowerCase(), attrs, traverse);
        }
        return delete b.attrs.dom_nodes;
      };
      screen.b('display', {
        dom_nodes: dom
      }, traverse);
    }
    return this.create(Literal, "");
  });

}).call(this);

      return exports;
    });
    
    _require['ext/eval'] = (function() {
      var exports = this;
      _require['ext/eval'] = function() { return exports; };
      var __dirname = './ext';
      (function() {
  var Document, MethodCall, Return, TML, eval_id;

  Document = require('nodes/document').Document;

  MethodCall = require('nodes/method_call').MethodCall;

  Return = require('nodes/return').Return;

  TML = require('tml');

  eval_id = 0;

  Document.preprocessor('eval', function(builder, code, namespace) {
    var block, entry_name, main, node, subscope, _i, _len, _ref;
    if (namespace == null) namespace = null;
    if (namespace === null) {
      subscope = this.current_scope().sub('eval');
    } else {
      if (namespace[0] === '.') {
        subscope = this.current_scope().root().sub(namespace.slice(1));
      } else {
        subscope = this.current_scope().sub(namespace);
      }
    }
    entry_name = '__eval_' + eval_id++;
    block = TML.parse(code).block;
    main = null;
    _ref = block.nodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      node = _ref[_i];
      if (node.getID && node.getID() === '__main__') {
        node.id = entry_name;
        main = node;
      }
    }
    if (!main) throw new Error("couldn't find main");
    block = main.block;
    block.parent = this;
    block.scope = subscope;
    block.run_prepare_blocks();
    return block;
  });

}).call(this);

      return exports;
    });
    
    _require['ext/getch'] = (function() {
      var exports = this;
      _require['ext/getch'] = function() { return exports; };
      var __dirname = './ext';
      (function() {
  var Document;

  Document = require('nodes/document').Document;

  Document.preprocessor('getch', function(builder, keys) {
    var i, key_screen, result, screen, _i, _len, _ref;
    if (keys == null) {
      keys = '0 1 2 3 4 5 6 7 8 9 f1 f2 f3 f4 f5 f6 f7 f8 f9 up down menu stop enter cancel';
    }
    result = this.current_scope().define('.last_key_pressed');
    screen = builder.current_screen();
    _ref = keys.split(/\s/);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      i = _ref[_i];
      key_screen = screen.branch({
        key: "" + i
      });
      key_screen.b('setvar', {
        name: 'last_key_pressed',
        lo: "" + i
      });
    }
    screen.branch_merge();
    return result;
  });

}).call(this);

      return exports;
    });
    
    _require['ext/layout'] = (function() {
      var exports = this;
      _require['ext/layout'] = function() { return exports; };
      var __dirname = './ext';
      (function() {
  var Document, Literal, ViewTemplate;

  Document = require('nodes/document').Document;

  Literal = require('nodes/literal').Literal;

  ViewTemplate = require('view_template').ViewTemplate;

  Document.preprocessor('layout', function(builder, filename) {
    this.root().layout = ViewTemplate.find(filename);
    return this.create(Literal, "");
  });

  Document.preprocessor("yield", function(builder) {
    var dom, template;
    if (template = this.root().current_template) {
      dom = template.process(this, builder);
      return this.create(Literal, dom);
    } else {
      return false;
    }
  });

}).call(this);

      return exports;
    });
    
    _require['ext/link_to'] = (function() {
      var exports = this;
      _require['ext/link_to'] = function() { return exports; };
      var __dirname = './ext';
      (function() {
  var Document, Literal, ViewTemplate;

  Document = require('nodes/document').Document;

  Literal = require('nodes/literal').Literal;

  ViewTemplate = require('view_template').ViewTemplate;

  Document.preprocessor('link_to', function(builder, caption, method_reference) {
    return "<a href=\"" + method_reference + "\">" + caption + "</a>";
  });

}).call(this);

      return exports;
    });
    
    _require['ext/post'] = (function() {
      var exports = this;
      _require['ext/post'] = function() { return exports; };
      var __dirname = './ext';
      (function() {
  var Document, Literal, ViewTemplate,
    __slice = Array.prototype.slice;

  Document = require('nodes/document').Document;

  Literal = require('nodes/literal').Literal;

  ViewTemplate = require('view_template').ViewTemplate;

  Document.preprocessor('post', function() {
    var builder, path, screen, variables,
      _this = this;
    builder = arguments[0], path = arguments[1], variables = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
    screen = builder.root.current_screen();
    screen.b('submit', {
      tgt: path
    }, function(b) {
      var variable, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = variables.length; _i < _len; _i++) {
        variable = variables[_i];
        _results.push(b.b('getvar', {
          name: variable.name
        }));
      }
      return _results;
    });
    return this.create(Literal, "");
  });

}).call(this);

      return exports;
    });
    
    _require['ext/read_card'] = (function() {
      var exports = this;
      _require['ext/read_card'] = function() { return exports; };
      var __dirname = './ext';
      (function() {
  var Document;

  Document = require('nodes/document').Document;

  Document.preprocessor('read_card', function(builder, card_type) {
    var card_types, result;
    card_types = (card_type ? card_type.split(/\s+/) : []);
    result = this.require(builder, 'std/card_parser');
    builder.current_screen().b('tform', function(b) {
      var params, parser, type, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = card_types.length; _i < _len; _i++) {
        type = card_types[_i];
        switch (type) {
          case 'mag':
          case 'magnetic':
            parser = 'mag';
            params = 'read_data';
            break;
          case 'emv':
            throw new Error("EMV is not supported yet");
            break;
          default:
            throw new Error("Expected card reader type to be 'magnetic', 'emv', or both; found " + type);
        }
        _results.push(b.b('card', {
          parser: parser,
          params: params
        }));
      }
      return _results;
    });
    return result;
  });

}).call(this);

      return exports;
    });
    
    _require['ext/require'] = (function() {
      var exports = this;
      _require['ext/require'] = function() { return exports; };
      var __dirname = './ext';
      (function() {
  var Document, fs, path;

  Document = require('nodes/document').Document;

  path = require('path');

  fs = require('fs');

  Document.preprocessor('require', function(builder, _path) {
    var match;
    this.namespace = _path;
    if (path.extname(_path) === "") _path = _path + $.ambrosia_file_ext;
    if (!(_path[0] === '/' || _path[0] === '\\')) {
      _path = path.join($.ambrosia_stdlib_path, _path);
    }
    while (match = /[\/\\]/.exec(this.namespace)) {
      this.namespace = this.namespace.replace(match[0], '.');
    }
    if (this.namespace[0] !== '.') this.namespace = "." + this.namespace;
    if (this.root().__dependencies[this.namespace]) {
      return this.create(Literal, "");
    }
    this.code = fs.readFileSync(_path, 'UTF-8');
    return this.invoke(builder, "eval", this.code, this.namespace) || this.create(Literal, "");
  });

}).call(this);

      return exports;
    });
    
    _require['extensions'] = (function() {
      var exports = this;
      _require['extensions'] = function() { return exports; };
      var __dirname = './.';
      (function() {

  require('ext/getch');

  require('ext/display');

  require('ext/eval');

  require('ext/require');

  require('ext/layout');

  require('ext/link_to');

  require('ext/post');

  require('ext/read_card');

}).call(this);

      return exports;
    });
    
    _require['grammar'] = (function() {
      var exports = this;
      _require['grammar'] = function() { return exports; };
      var __dirname = './.';
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

      return exports;
    });
    
    _require['helpers'] = (function() {
      var exports = this;
      _require['helpers'] = function() { return exports; };
      var __dirname = './.';
      (function() {
  var extend, flatten;

  exports.starts = function(string, literal, start) {
    return literal === string.substr(start, literal.length);
  };

  exports.ends = function(string, literal, back) {
    var len;
    len = literal.length;
    return literal === string.substr(string.length - len - (back || 0), len);
  };

  exports.compact = function(array) {
    var item, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = array.length; _i < _len; _i++) {
      item = array[_i];
      if (item) _results.push(item);
    }
    return _results;
  };

  exports.count = function(string, substr) {
    var num, pos;
    num = pos = 0;
    if (!substr.length) return 1 / 0;
    while (pos = 1 + string.indexOf(substr, pos)) {
      num++;
    }
    return num;
  };

  exports.merge = function(options, overrides) {
    return extend(extend({}, options), overrides);
  };

  extend = exports.extend = function(object, properties) {
    var key, val;
    for (key in properties) {
      val = properties[key];
      object[key] = val;
    }
    return object;
  };

  exports.flatten = flatten = function(array) {
    var element, flattened, _i, _len;
    flattened = [];
    for (_i = 0, _len = array.length; _i < _len; _i++) {
      element = array[_i];
      if (element instanceof Array) {
        flattened = flattened.concat(flatten(element));
      } else {
        flattened.push(element);
      }
    }
    return flattened;
  };

  exports.del = function(obj, key) {
    var val;
    val = obj[key];
    delete obj[key];
    return val;
  };

  exports.last = function(array, back) {
    return array[array.length - (back || 0) - 1];
  };

}).call(this);

      return exports;
    });
    
    _require['lexer'] = (function() {
      var exports = this;
      _require['lexer'] = function() { return exports; };
      var __dirname = './.';
      (function() {
  var BOOL, CALLABLE, CODE, COFFEE_ALIASES, COFFEE_ALIAS_MAP, COFFEE_KEYWORDS, COMMENT, COMPARE, COMPOUND_ASSIGN, HEREDOC, HEREDOC_ILLEGAL, HEREDOC_INDENT, HEREGEX, HEREGEX_OMIT, IDENTIFIER, INDEXABLE, INVERSES, JSTOKEN, JS_FORBIDDEN, JS_KEYWORDS, LINE_BREAK, LINE_CONTINUER, LOGIC, Lexer, MATH, MULTILINER, MULTI_DENT, NOT_REGEX, NOT_SPACED_REGEX, NUMBER, OPERATOR, REGEX, RELATION, RESERVED, Rewriter, SHIFT, SIMPLESTR, TRAILING_SPACES, UNARY, WHITESPACE, compact, count, key, last, starts, _ref, _ref2,
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = require('rewriter'), Rewriter = _ref.Rewriter, INVERSES = _ref.INVERSES;

  _ref2 = require('helpers'), count = _ref2.count, starts = _ref2.starts, compact = _ref2.compact, last = _ref2.last;

  exports.Lexer = Lexer = (function() {

    function Lexer() {}

    Lexer.prototype.tokenize = function(code, opts) {
      var i, tag;
      if (opts == null) opts = {};
      if (WHITESPACE.test(code)) code = "\n" + code;
      code = code.replace(/\r/g, '').replace(TRAILING_SPACES, '');
      this.code = code;
      this.line = opts.line || 0;
      this.indent = 0;
      this.indebt = 0;
      this.outdebt = 0;
      this.indents = [];
      this.ends = [];
      this.tokens = [];
      i = 0;
      while (this.chunk = code.slice(i)) {
        i += this.identifierToken() || this.commentToken() || this.whitespaceToken() || this.lineToken() || this.heredocToken() || this.stringToken() || this.numberToken() || this.regexToken() || this.jsToken() || this.literalToken();
      }
      this.closeIndentation();
      if (tag = this.ends.pop()) this.error("missing " + tag);
      if (opts.rewrite === false) return this.tokens;
      return (new Rewriter).rewrite(this.tokens);
    };

    Lexer.prototype.identifierToken = function() {
      var colon, forcedIdentifier, id, input, match, prev, tag, _ref3, _ref4;
      if (!(match = IDENTIFIER.exec(this.chunk))) return 0;
      input = match[0], id = match[1], colon = match[2];
      if (id === 'own' && this.tag() === 'FOR') {
        this.token('OWN', id);
        return id.length;
      }
      forcedIdentifier = colon || (prev = last(this.tokens)) && (((_ref3 = prev[0]) === '.' || _ref3 === '?.' || _ref3 === '::') || !prev.spaced && prev[0] === '@');
      tag = 'IDENTIFIER';
      if (!forcedIdentifier && (__indexOf.call(JS_KEYWORDS, id) >= 0 || __indexOf.call(COFFEE_KEYWORDS, id) >= 0)) {
        tag = id.toUpperCase();
        if (tag === 'WHEN' && (_ref4 = this.tag(), __indexOf.call(LINE_BREAK, _ref4) >= 0)) {
          tag = 'LEADING_WHEN';
        } else if (tag === 'FOR') {
          this.seenFor = true;
        } else if (tag === 'UNLESS') {
          tag = 'IF';
        } else if (__indexOf.call(UNARY, tag) >= 0) {
          tag = 'UNARY';
        } else if (__indexOf.call(RELATION, tag) >= 0) {
          if (tag !== 'INSTANCEOF' && this.seenFor) {
            tag = 'FOR' + tag;
            this.seenFor = false;
          } else {
            tag = 'RELATION';
            if (this.value() === '!') {
              this.tokens.pop();
              id = '!' + id;
            }
          }
        }
      }
      if (__indexOf.call(['eval', 'arguments'].concat(JS_FORBIDDEN), id) >= 0) {
        if (forcedIdentifier) {
          tag = 'IDENTIFIER';
          id = new String(id);
          id.reserved = true;
        } else if (__indexOf.call(RESERVED, id) >= 0) {
          this.error("Reserved word \"" + word + "\"");
        }
      }
      if (!forcedIdentifier) {
        if (__indexOf.call(COFFEE_ALIASES, id) >= 0) id = COFFEE_ALIAS_MAP[id];
        tag = (function() {
          switch (id) {
            case '!':
              return 'UNARY';
            case '==':
            case '!=':
              return 'COMPARE';
            case '&&':
            case '||':
              return 'LOGIC';
            case 'true':
            case 'false':
            case 'null':
            case 'undefined':
              return 'BOOL';
            case 'break':
            case 'continue':
            case 'debugger':
              return 'STATEMENT';
            default:
              return tag;
          }
        })();
      }
      this.token(tag, id);
      if (colon) this.token(':', ':');
      return input.length;
    };

    Lexer.prototype.numberToken = function() {
      var match, number;
      if (!(match = NUMBER.exec(this.chunk))) return 0;
      number = match[0];
      this.token('NUMBER', number);
      return number.length;
    };

    Lexer.prototype.stringToken = function() {
      var match, string;
      switch (this.chunk.charAt(0)) {
        case "'":
          if (!(match = SIMPLESTR.exec(this.chunk))) return 0;
          this.token('STRING', (string = match[0]).replace(MULTILINER, '\\\n'));
          break;
        case '"':
          if (!(string = this.balancedString(this.chunk, '"'))) return 0;
          if (0 < string.indexOf('#{', 1)) {
            this.interpolateString(string.slice(1, -1));
          } else {
            this.token('STRING', this.escapeLines(string));
          }
          break;
        default:
          return 0;
      }
      this.line += count(string, '\n');
      return string.length;
    };

    Lexer.prototype.heredocToken = function() {
      var doc, heredoc, match, quote;
      if (!(match = HEREDOC.exec(this.chunk))) return 0;
      heredoc = match[0];
      quote = heredoc.charAt(0);
      doc = this.sanitizeHeredoc(match[2], {
        quote: quote,
        indent: null
      });
      if (quote === '"' && 0 <= doc.indexOf('#{')) {
        this.interpolateString(doc, {
          heredoc: true
        });
      } else {
        this.token('STRING', this.makeString(doc, quote, true));
      }
      this.line += count(heredoc, '\n');
      return heredoc.length;
    };

    Lexer.prototype.commentToken = function() {
      var comment, here, match;
      if (!(match = this.chunk.match(COMMENT))) return 0;
      comment = match[0], here = match[1];
      if (here) {
        this.token('HERECOMMENT', this.sanitizeHeredoc(here, {
          herecomment: true,
          indent: Array(this.indent + 1).join(' ')
        }));
        this.token('TERMINATOR', '\n');
      }
      this.line += count(comment, '\n');
      return comment.length;
    };

    Lexer.prototype.jsToken = function() {
      var match, script;
      if (!(this.chunk.charAt(0) === '`' && (match = JSTOKEN.exec(this.chunk)))) {
        return 0;
      }
      this.token('JS', (script = match[0]).slice(1, -1));
      return script.length;
    };

    Lexer.prototype.regexToken = function() {
      var length, match, prev, regex, _ref3;
      if (this.chunk.charAt(0) !== '/') return 0;
      if (match = HEREGEX.exec(this.chunk)) {
        length = this.heregexToken(match);
        this.line += count(match[0], '\n');
        return length;
      }
      prev = last(this.tokens);
      if (prev && (_ref3 = prev[0], __indexOf.call((prev.spaced ? NOT_REGEX : NOT_SPACED_REGEX), _ref3) >= 0)) {
        return 0;
      }
      if (!(match = REGEX.exec(this.chunk))) return 0;
      regex = match[0];
      this.token('REGEX', regex === '//' ? '/(?:)/' : regex);
      return regex.length;
    };

    Lexer.prototype.heregexToken = function(match) {
      var body, flags, heregex, re, tag, tokens, value, _i, _len, _ref3, _ref4, _ref5, _ref6;
      heregex = match[0], body = match[1], flags = match[2];
      if (0 > body.indexOf('#{')) {
        re = body.replace(HEREGEX_OMIT, '').replace(/\//g, '\\/');
        this.token('REGEX', "/" + (re || '(?:)') + "/" + flags);
        return heregex.length;
      }
      this.token('IDENTIFIER', 'RegExp');
      this.tokens.push(['CALL_START', '(']);
      tokens = [];
      _ref3 = this.interpolateString(body, {
        regex: true
      });
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        _ref4 = _ref3[_i], tag = _ref4[0], value = _ref4[1];
        if (tag === 'TOKENS') {
          tokens.push.apply(tokens, value);
        } else {
          if (!(value = value.replace(HEREGEX_OMIT, ''))) continue;
          value = value.replace(/\\/g, '\\\\');
          tokens.push(['STRING', this.makeString(value, '"', true)]);
        }
        tokens.push(['+', '+']);
      }
      tokens.pop();
      if (((_ref5 = tokens[0]) != null ? _ref5[0] : void 0) !== 'STRING') {
        this.tokens.push(['STRING', '""'], ['+', '+']);
      }
      (_ref6 = this.tokens).push.apply(_ref6, tokens);
      if (flags) this.tokens.push([',', ','], ['STRING', '"' + flags + '"']);
      this.token(')', ')');
      return heregex.length;
    };

    Lexer.prototype.lineToken = function() {
      var diff, indent, match, noNewlines, prev, size;
      if (!(match = MULTI_DENT.exec(this.chunk))) return 0;
      indent = match[0];
      this.line += count(indent, '\n');
      prev = last(this.tokens, 1);
      size = indent.length - 1 - indent.lastIndexOf('\n');
      noNewlines = this.unfinished();
      if (size - this.indebt === this.indent) {
        if (noNewlines) {
          this.suppressNewlines();
        } else {
          this.newlineToken();
        }
        return indent.length;
      }
      if (size > this.indent) {
        if (noNewlines) {
          this.indebt = size - this.indent;
          this.suppressNewlines();
          return indent.length;
        }
        diff = size - this.indent + this.outdebt;
        this.token('INDENT', diff);
        this.indents.push(diff);
        this.ends.push('OUTDENT');
        this.outdebt = this.indebt = 0;
      } else {
        this.indebt = 0;
        this.outdentToken(this.indent - size, noNewlines);
      }
      this.indent = size;
      return indent.length;
    };

    Lexer.prototype.outdentToken = function(moveOut, noNewlines) {
      var dent, len;
      while (moveOut > 0) {
        len = this.indents.length - 1;
        if (this.indents[len] === void 0) {
          moveOut = 0;
        } else if (this.indents[len] === this.outdebt) {
          moveOut -= this.outdebt;
          this.outdebt = 0;
        } else if (this.indents[len] < this.outdebt) {
          this.outdebt -= this.indents[len];
          moveOut -= this.indents[len];
        } else {
          dent = this.indents.pop() - this.outdebt;
          moveOut -= dent;
          this.outdebt = 0;
          this.pair('OUTDENT');
          this.token('OUTDENT', dent);
        }
      }
      if (dent) this.outdebt -= moveOut;
      while (this.value() === ';') {
        this.tokens.pop();
      }
      if (!(this.tag() === 'TERMINATOR' || noNewlines)) {
        this.token('TERMINATOR', '\n');
      }
      return this;
    };

    Lexer.prototype.whitespaceToken = function() {
      var match, nline, prev;
      if (!((match = WHITESPACE.exec(this.chunk)) || (nline = this.chunk.charAt(0) === '\n'))) {
        return 0;
      }
      prev = last(this.tokens);
      if (prev) prev[match ? 'spaced' : 'newLine'] = true;
      if (match) {
        return match[0].length;
      } else {
        return 0;
      }
    };

    Lexer.prototype.newlineToken = function() {
      while (this.value() === ';') {
        this.tokens.pop();
      }
      if (this.tag() !== 'TERMINATOR') this.token('TERMINATOR', '\n');
      return this;
    };

    Lexer.prototype.suppressNewlines = function() {
      if (this.value() === '\\') this.tokens.pop();
      return this;
    };

    Lexer.prototype.literalToken = function() {
      var match, prev, tag, value, _ref3, _ref4, _ref5, _ref6;
      if (match = OPERATOR.exec(this.chunk)) {
        value = match[0];
        if (CODE.test(value)) this.tagParameters();
      } else {
        value = this.chunk.charAt(0);
      }
      tag = value;
      prev = last(this.tokens);
      if (value === '=' && prev) {
        if (!prev[1].reserved && (_ref3 = prev[1], __indexOf.call(JS_FORBIDDEN, _ref3) >= 0)) {
          this.error("Reserved word \"" + (this.value()) + "\" can't be assigned");
        }
        if ((_ref4 = prev[1]) === '||' || _ref4 === '&&') {
          prev[0] = 'COMPOUND_ASSIGN';
          prev[1] += '=';
          return value.length;
        }
      }
      if (value === ';') {
        tag = 'TERMINATOR';
      } else if (__indexOf.call(MATH, value) >= 0) {
        tag = 'MATH';
      } else if (__indexOf.call(COMPARE, value) >= 0) {
        tag = 'COMPARE';
      } else if (__indexOf.call(COMPOUND_ASSIGN, value) >= 0) {
        tag = 'COMPOUND_ASSIGN';
      } else if (__indexOf.call(UNARY, value) >= 0) {
        tag = 'UNARY';
      } else if (__indexOf.call(SHIFT, value) >= 0) {
        tag = 'SHIFT';
      } else if (__indexOf.call(LOGIC, value) >= 0 || value === '?' && (prev != null ? prev.spaced : void 0)) {
        tag = 'LOGIC';
      } else if (prev && !prev.spaced) {
        if (value === '(' && (_ref5 = prev[0], __indexOf.call(CALLABLE, _ref5) >= 0)) {
          if (prev[0] === '?') prev[0] = 'FUNC_EXIST';
          tag = 'CALL_START';
        } else if (value === '[' && (_ref6 = prev[0], __indexOf.call(INDEXABLE, _ref6) >= 0)) {
          tag = 'INDEX_START';
          switch (prev[0]) {
            case '?':
              prev[0] = 'INDEX_SOAK';
          }
        }
      }
      switch (value) {
        case '(':
        case '{':
        case '[':
          this.ends.push(INVERSES[value]);
          break;
        case ')':
        case '}':
        case ']':
          this.pair(value);
      }
      this.token(tag, value);
      return value.length;
    };

    Lexer.prototype.sanitizeHeredoc = function(doc, options) {
      var attempt, herecomment, indent, match, _ref3;
      indent = options.indent, herecomment = options.herecomment;
      if (herecomment) {
        if (HEREDOC_ILLEGAL.test(doc)) {
          this.error("block comment cannot contain \"*/\", starting");
        }
        if (doc.indexOf('\n') <= 0) return doc;
      } else {
        while (match = HEREDOC_INDENT.exec(doc)) {
          attempt = match[1];
          if (indent === null || (0 < (_ref3 = attempt.length) && _ref3 < indent.length)) {
            indent = attempt;
          }
        }
      }
      if (indent) doc = doc.replace(RegExp("\\n" + indent, "g"), '\n');
      if (!herecomment) doc = doc.replace(/^\n/, '');
      return doc;
    };

    Lexer.prototype.tagParameters = function() {
      var i, stack, tok, tokens;
      if (this.tag() !== ')') return this;
      stack = [];
      tokens = this.tokens;
      i = tokens.length;
      tokens[--i][0] = 'PARAM_END';
      while (tok = tokens[--i]) {
        switch (tok[0]) {
          case ')':
            stack.push(tok);
            break;
          case '(':
          case 'CALL_START':
            if (stack.length) {
              stack.pop();
            } else if (tok[0] === '(') {
              tok[0] = 'PARAM_START';
              return this;
            } else {
              return this;
            }
        }
      }
      return this;
    };

    Lexer.prototype.closeIndentation = function() {
      return this.outdentToken(this.indent);
    };

    Lexer.prototype.balancedString = function(str, end) {
      var i, letter, match, prev, stack, _ref3;
      stack = [end];
      for (i = 1, _ref3 = str.length; 1 <= _ref3 ? i < _ref3 : i > _ref3; 1 <= _ref3 ? i++ : i--) {
        switch (letter = str.charAt(i)) {
          case '\\':
            i++;
            continue;
          case end:
            stack.pop();
            if (!stack.length) return str.slice(0, i + 1);
            end = stack[stack.length - 1];
            continue;
        }
        if (end === '}' && (letter === '"' || letter === "'")) {
          stack.push(end = letter);
        } else if (end === '}' && letter === '/' && (match = HEREGEX.exec(str.slice(i)) || REGEX.exec(str.slice(i)))) {
          i += match[0].length - 1;
        } else if (end === '}' && letter === '{') {
          stack.push(end = '}');
        } else if (end === '"' && prev === '#' && letter === '{') {
          stack.push(end = '}');
        }
        prev = letter;
      }
      return this.error("missing " + (stack.pop()) + ", starting");
    };

    Lexer.prototype.interpolateString = function(str, options) {
      var expr, heredoc, i, inner, interpolated, len, letter, nested, pi, regex, tag, tokens, value, _len, _ref3, _ref4, _ref5;
      if (options == null) options = {};
      heredoc = options.heredoc, regex = options.regex;
      tokens = [];
      pi = 0;
      i = -1;
      while (letter = str.charAt(i += 1)) {
        if (letter === '\\') {
          i += 1;
          continue;
        }
        if (!(letter === '#' && str.charAt(i + 1) === '{' && (expr = this.balancedString(str.slice(i + 1), '}')))) {
          continue;
        }
        if (pi < i) tokens.push(['NEOSTRING', str.slice(pi, i)]);
        inner = expr.slice(1, -1);
        if (inner.length) {
          nested = new Lexer().tokenize(inner, {
            line: this.line,
            rewrite: false
          });
          nested.pop();
          if (((_ref3 = nested[0]) != null ? _ref3[0] : void 0) === 'TERMINATOR') {
            nested.shift();
          }
          if (len = nested.length) {
            if (len > 1) {
              nested.unshift(['(', '(']);
              nested.push([')', ')']);
            }
            tokens.push(['TOKENS', nested]);
          }
        }
        i += expr.length;
        pi = i + 1;
      }
      if ((i > pi && pi < str.length)) tokens.push(['NEOSTRING', str.slice(pi)]);
      if (regex) return tokens;
      if (!tokens.length) return this.token('STRING', '""');
      if (tokens[0][0] !== 'NEOSTRING') tokens.unshift(['', '']);
      if (interpolated = tokens.length > 1) this.token('(', '(');
      for (i = 0, _len = tokens.length; i < _len; i++) {
        _ref4 = tokens[i], tag = _ref4[0], value = _ref4[1];
        if (i) this.token('+', '+');
        if (tag === 'TOKENS') {
          (_ref5 = this.tokens).push.apply(_ref5, value);
        } else {
          this.token('STRING', this.makeString(value, '"', heredoc));
        }
      }
      if (interpolated) this.token(')', ')');
      return tokens;
    };

    Lexer.prototype.pair = function(tag) {
      var size, wanted;
      if (tag !== (wanted = last(this.ends))) {
        if ('OUTDENT' !== wanted) this.error("unmatched " + tag);
        this.indent -= size = last(this.indents);
        this.outdentToken(size, true);
        return this.pair(tag);
      }
      return this.ends.pop();
    };

    Lexer.prototype.token = function(tag, value) {
      return this.tokens.push([tag, value, this.line]);
    };

    Lexer.prototype.tag = function(index, tag) {
      var tok;
      return (tok = last(this.tokens, index)) && (tag ? tok[0] = tag : tok[0]);
    };

    Lexer.prototype.value = function(index, val) {
      var tok;
      return (tok = last(this.tokens, index)) && (val ? tok[1] = val : tok[1]);
    };

    Lexer.prototype.unfinished = function() {
      var _ref3;
      return LINE_CONTINUER.test(this.chunk) || ((_ref3 = this.tag()) === '\\' || _ref3 === '.' || _ref3 === '?.' || _ref3 === 'UNARY' || _ref3 === 'MATH' || _ref3 === '+' || _ref3 === '-' || _ref3 === 'SHIFT' || _ref3 === 'RELATION' || _ref3 === 'COMPARE' || _ref3 === 'LOGIC' || _ref3 === 'COMPOUND_ASSIGN' || _ref3 === 'THROW' || _ref3 === 'EXTENDS');
    };

    Lexer.prototype.escapeLines = function(str, heredoc) {
      return str.replace(MULTILINER, heredoc ? '\\n' : '');
    };

    Lexer.prototype.makeString = function(body, quote, heredoc) {
      if (!body) return quote + quote;
      body = body.replace(/\\([\s\S])/g, function(match, contents) {
        if (contents === '\n' || contents === quote) {
          return contents;
        } else {
          return match;
        }
      });
      body = body.replace(RegExp("" + quote, "g"), '\\$&');
      return quote + this.escapeLines(body, heredoc) + quote;
    };

    Lexer.prototype.error = function(message) {
      throw SyntaxError("" + message + " on line " + (this.line + 1));
    };

    return Lexer;

  })();

  JS_KEYWORDS = ['true', 'false', 'null', 'this', 'new', 'delete', 'typeof', 'in', 'instanceof', 'return', 'throw', 'break', 'continue', 'debugger', 'if', 'else', 'switch', 'for', 'while', 'do', 'try', 'catch', 'finally', 'class', 'extends', 'super'];

  COFFEE_KEYWORDS = ['undefined', 'then', 'unless', 'until', 'loop', 'of', 'by', 'when'];

  COFFEE_ALIAS_MAP = {
    and: '&&',
    or: '||',
    is: '==',
    isnt: '!=',
    not: '!',
    yes: 'true',
    no: 'false',
    on: 'true',
    off: 'false'
  };

  COFFEE_ALIASES = (function() {
    var _results;
    _results = [];
    for (key in COFFEE_ALIAS_MAP) {
      _results.push(key);
    }
    return _results;
  })();

  COFFEE_KEYWORDS = COFFEE_KEYWORDS.concat(COFFEE_ALIASES);

  RESERVED = ['case', 'default', 'function', 'var', 'void', 'with', 'const', 'let', 'enum', 'export', 'import', 'native', '__hasProp', '__extends', '__slice', '__bind', '__indexOf'];

  JS_FORBIDDEN = JS_KEYWORDS.concat(RESERVED);

  exports.RESERVED = RESERVED.concat(JS_KEYWORDS).concat(COFFEE_KEYWORDS);

  IDENTIFIER = /^([$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff]*)([^\n\S]*:(?!:))?/;

  NUMBER = /^0x[\da-f]+|^\d*\.?\d+(?:e[+-]?\d+)?/i;

  HEREDOC = /^("""|''')([\s\S]*?)(?:\n[^\n\S]*)?\1/;

  OPERATOR = /^(?:[-=]>|[-+*\/%<>&|^!?=]=|>>>=?|([-+:])\1|([&|<>])\2=?|\?\.|\.{2,3})/;

  WHITESPACE = /^[^\n\S]+/;

  COMMENT = /^###([^#][\s\S]*?)(?:###[^\n\S]*|(?:###)?$)|^(?:\s*#(?!##[^#]).*)+/;

  CODE = /^[-=]>/;

  MULTI_DENT = /^(?:\n[^\n\S]*)+/;

  SIMPLESTR = /^'[^\\']*(?:\\.[^\\']*)*'/;

  JSTOKEN = /^`[^\\`]*(?:\\.[^\\`]*)*`/;

  REGEX = /^\/(?![\s=])[^[\/\n\\]*(?:(?:\\[\s\S]|\[[^\]\n\\]*(?:\\[\s\S][^\]\n\\]*)*])[^[\/\n\\]*)*\/[imgy]{0,4}(?!\w)/;

  HEREGEX = /^\/{3}([\s\S]+?)\/{3}([imgy]{0,4})(?!\w)/;

  HEREGEX_OMIT = /\s+(?:#.*)?/g;

  MULTILINER = /\n/g;

  HEREDOC_INDENT = /\n+([^\n\S]*)/g;

  HEREDOC_ILLEGAL = /\*\//;

  LINE_CONTINUER = /^\s*(?:,|\??\.(?![.\d])|::)/;

  TRAILING_SPACES = /\s+$/;

  COMPOUND_ASSIGN = ['-=', '+=', '/=', '*=', '%=', '||=', '&&=', '?=', '<<=', '>>=', '>>>=', '&=', '^=', '|='];

  UNARY = ['!', '~', 'NEW', 'TYPEOF', 'DELETE', 'DO'];

  LOGIC = ['&&', '||', '&', '|', '^'];

  SHIFT = ['<<', '>>', '>>>'];

  COMPARE = ['==', '!=', '<', '>', '<=', '>='];

  MATH = ['*', '/', '%'];

  RELATION = ['IN', 'OF', 'INSTANCEOF'];

  BOOL = ['TRUE', 'FALSE', 'NULL', 'UNDEFINED'];

  NOT_REGEX = ['NUMBER', 'REGEX', 'BOOL', '++', '--', ']'];

  NOT_SPACED_REGEX = NOT_REGEX.concat(')', '}', 'THIS', 'IDENTIFIER', 'STRING');

  CALLABLE = ['IDENTIFIER', 'STRING', 'REGEX', ')', ']', '}', '?', '::', '@', 'THIS', 'SUPER'];

  INDEXABLE = CALLABLE.concat('NUMBER', 'BOOL');

  LINE_BREAK = ['INDENT', 'OUTDENT', 'TERMINATOR'];

}).call(this);

      return exports;
    });
    
    _require['nodes'] = (function() {
      var exports = this;
      _require['nodes'] = function() { return exports; };
      var __dirname = './.';
      (function() {
  var class_name, file_name, node, nodes, _i, _len, _ref, _ref2;

  nodes = "CLASS_NAME        FILE_NAME\n\nBase              base\nDocument          document\nBlock             block\nLiteral           literal\nAssign            assign\nIdentifier        identifier\nReturn            return\nOperation         operation\nParens            parens\nListIndex         list_index\nMethodReference   method_reference\nMethod            method\nMethodCall        method_call\nIf                if\nClosure           closure\nForIn             for_in\nRange             range\nForOf             for_of\nPropertyAccess    property_access\nSwitch            switch\nThrow             throw\nEmbeddedTML       embedded_tml\nArray             array".split(/\n/);

  _ref = nodes.slice(2);
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    node = _ref[_i];
    _ref2 = node.trim().split(/\s+/), class_name = _ref2[0], file_name = _ref2[1];
    exports[class_name] = require("nodes/" + file_name)[class_name];
  }

}).call(this);

      return exports;
    });
    
    _require['nodes/array'] = (function() {
      var exports = this;
      _require['nodes/array'] = function() { return exports; };
      var __dirname = './nodes';
      (function() {
  var Ary, Base, Identifier, Variable,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __slice = Array.prototype.slice;

  Base = require('nodes/base').Base;

  Variable = require('variable_scope').Variable;

  Identifier = require('nodes/identifier').Identifier;

  exports.Array = Ary = (function(_super) {

    __extends(Ary, _super);

    function Ary() {
      var nodes;
      nodes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this.nodes = nodes;
      this.values = nodes.shift();
      Ary.__super__.constructor.apply(this, nodes);
    }

    Ary.prototype.type = function() {
      return 'string';
    };

    Ary.prototype.children = function() {
      return [];
    };

    Ary.prototype.get_dependent_variable = function() {
      return this.values.get_dependent_variable();
    };

    Ary.prototype.to_code = function() {
      return "[" + (this.real().join(',')) + "]";
    };

    Ary.prototype.prepare = function() {};

    Ary.prototype.real = function() {
      var val, _i, _len, _ref, _results;
      _ref = this.values;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        val = _ref[_i];
        _results.push(val.value);
      }
      return _results;
    };

    Ary.prototype.compile = function(screen) {
      var val;
      return ((function() {
        var _i, _len, _ref, _results;
        _ref = this.values;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          val = _ref[_i];
          _results.push(val.value);
        }
        return _results;
      }).call(this)).join(';');
    };

    return Ary;

  })(Base);

}).call(this);

      return exports;
    });
    
    _require['nodes/assign'] = (function() {
      var exports = this;
      _require['nodes/assign'] = function() { return exports; };
      var __dirname = './nodes';
      (function() {
  var Assign, Base, Identifier, Variable,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Base = require('nodes/base').Base;

  Variable = require('variable_scope').Variable;

  Identifier = require('nodes/identifier').Identifier;

  exports.Assign = Assign = (function(_super) {

    __extends(Assign, _super);

    function Assign() {
      Assign.__super__.constructor.apply(this, arguments);
    }

    Assign.prototype.type = function() {
      return this.rvalue.type();
    };

    Assign.prototype.children = function() {
      return ['lvalue', 'rvalue'];
    };

    Assign.prototype.get_dependent_variable = function() {
      return this.lvalue.get_dependent_variable();
    };

    Assign.prototype.to_code = function() {
      return this.lvalue.to_code() + " = " + this.rvalue.to_code();
    };

    Assign.prototype.prepare = function() {};

    Assign.prototype.compile = function(screen) {
      var dependent, lval, rval, setvar, type;
      if (this.lvalue instanceof Assign) {
        throw new Error("Can't use assignment as left value");
      }
      rval = this.rvalue.compile(screen.root.current_screen());
      screen = screen.root.current_screen();
      if (screen.is_wait_screen()) screen = screen.extend();
      type = this.rvalue.type();
      dependent = this.rvalue instanceof Identifier && this.rvalue.get_dependent_variable();
      if (dependent instanceof Variable && dependent.name.indexOf("__generic_method_param") === 0) {
        type = null;
      }
      if (this.lvalue.name.slice(0, 2) === '$.') {
        $[this.lvalue.name.slice(2)] = this.rvalue.real();
      } else {
        lval = this.current_scope().define(this.lvalue.name, type);
        setvar = screen.b('setvar', {
          name: lval.name
        });
        this.lvalue.assign_value(setvar, rval, type || 'string');
      }
      return lval;
    };

    return Assign;

  })(Base);

}).call(this);

      return exports;
    });
    
    _require['nodes/base'] = (function() {
      var exports = this;
      _require['nodes/base'] = function() { return exports; };
      var __dirname = './nodes';
      (function() {
  var Base,
    __slice = Array.prototype.slice;

  exports.Base = Base = (function() {

    Base.prototype.debug = function(mesg) {
      if (process.env['DEBUG']) return console.log(mesg);
    };

    function Base() {
      var children, index, node, nodes, self, setParent, _ref;
      nodes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this.nodes = nodes;
      nodes = this.nodes;
      self = this;
      if (this.children) children = this.children();
      setParent = function(node) {
        var n, _i, _len, _results;
        node.parent = self;
        if (node instanceof Array) {
          _results = [];
          for (_i = 0, _len = node.length; _i < _len; _i++) {
            n = node[_i];
            _results.push(setParent(n));
          }
          return _results;
        }
      };
      for (index = 0, _ref = nodes.length; 0 <= _ref ? index < _ref : index > _ref; 0 <= _ref ? index++ : index--) {
        node = nodes[index];
        setParent(node);
        if (children && children[index] !== void 0) self[children[index]] = node;
      }
      if (this.after_initialize) this.after_initialize();
    }

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

      return exports;
    });
    
    _require['nodes/block'] = (function() {
      var exports = this;
      _require['nodes/block'] = function() { return exports; };
      var __dirname = './nodes';
      (function() {
  var Base, Block, Document, Return,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Base = require('nodes/base').Base;

  Document = require('nodes/document').Document;

  Return = require('nodes/return').Return;

  exports.Block = Block = (function(_super) {

    __extends(Block, _super);

    function Block(nodes) {
      Block.__super__.constructor.apply(this, nodes);
    }

    Block.prototype.to_code = function() {
      var node;
      return "  " + ((function() {
        var _i, _len, _ref, _results;
        _ref = this.nodes;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          node = _ref[_i];
          _results.push(node.to_code().split(/\n/).join("\n  "));
        }
        return _results;
      }).call(this)).join("\n  ");
    };

    Block.prototype.type = function() {
      return this.nodes[this.nodes.length - 1].type();
    };

    Block.prototype.compile = function(builder) {
      var last_result, node, _i, _len, _ref;
      this.debug("> " + this.to_code().split(/\n/).join("\n> "));
      last_result = null;
      _ref = this.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        last_result = node.compile(builder);
      }
      return last_result;
    };

    Block.prototype.push = function(node) {
      node.parent = this;
      this.nodes.push(node);
      if (this.root() instanceof Document) return node.run_prepare_blocks();
    };

    Block.prototype.concat = function(ary) {
      var node, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = ary.length; _i < _len; _i++) {
        node = ary[_i];
        _results.push(this.push(node));
      }
      return _results;
    };

    Block.prototype.nodes_matching = function(name) {
      var ary, node, _i, _len, _ref;
      ary = [];
      _ref = this.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        if (node.__proto__.constructor.name === name) ary.push(node);
      }
      return ary;
    };

    Block.wrap = function(nodes) {
      if (nodes.length === 1 && nodes[0] instanceof Block) return nodes[0];
      return new Block(nodes);
    };

    return Block;

  })(Base);

}).call(this);

      return exports;
    });
    
    _require['nodes/closure'] = (function() {
      var exports = this;
      _require['nodes/closure'] = function() { return exports; };
      var __dirname = './nodes';
      (function() {
  var Closure, Method,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Method = require('nodes/method').Method;

  exports.Closure = Closure = (function(_super) {

    __extends(Closure, _super);

    function Closure() {
      Closure.__super__.constructor.apply(this, arguments);
    }

    Closure.__closure_id || (Closure.__closure_id = 0);

    Closure.prototype.getID = function() {
      return this.id || (this.id = "_closure_" + ++Closure.__closure_id);
    };

    Closure.prototype.children = function() {
      return ['params', 'block'];
    };

    Closure.prototype.to_code = function() {
      var param;
      return "(" + (((function() {
        var _i, _len, _ref, _results;
        _ref = this.params;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          param = _ref[_i];
          _results.push(param.to_code);
        }
        return _results;
      }).call(this)).join(', ')) + ") ->\n" + (this.block.to_code());
    };

    return Closure;

  })(Method);

}).call(this);

      return exports;
    });
    
    _require['nodes/document'] = (function() {
      var exports = this;
      _require['nodes/document'] = function() { return exports; };
      var __dirname = './nodes';
      (function() {
  var Base, Document, TMLBuilder, VariableScope,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __slice = Array.prototype.slice;

  Base = require('nodes/base').Base;

  TMLBuilder = require('tml_builder').TMLBuilder;

  VariableScope = require('variable_scope').VariableScope;

  exports.Document = Document = (function(_super) {

    __extends(Document, _super);

    Document.preprocessors || (Document.preprocessors = {});

    function Document() {
      var nodes;
      nodes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this.scope = new VariableScope;
      this.methods = {};
      this.__dependencies = {};
      Document.__super__.constructor.apply(this, arguments);
    }

    Document.preprocessor = function() {
      var args, body, name, _i;
      name = arguments[0], args = 3 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), body = arguments[_i++];
      if (Document.preprocessors[name]) {
        throw new Error("A preprocessor named " + name + " already exists");
      }
      return Document.preprocessors[name] = {
        name: name,
        invoke: body
      };
    };

    Document.prototype.instance_name = function() {
      return this.current_scope().prefix() + Document.__super__.instance_name.apply(this, arguments);
    };

    Document.prototype.silently_find_method = function(name) {
      var retval;
      if (this.methods[name]) return this.methods[name];
      retval = null;
      this.each_dependency(function(dep) {
        var method;
        if (method = dep.silently_find_method(name)) {
          return retval || (retval = method);
        }
      });
      return retval;
    };

    Document.prototype.each_dependency = function(callback) {
      var dep, doc, _ref, _results;
      _ref = this.__dependencies;
      _results = [];
      for (dep in _ref) {
        doc = _ref[dep];
        _results.push(callback(doc));
      }
      return _results;
    };

    Document.prototype.find_method = function(name) {
      var method;
      if (method = this.silently_find_method(name)) return method;
      throw new Error("No method named " + name);
    };

    Document.prototype.children = function() {
      return ['block'];
    };

    Document.prototype.to_code = function() {
      return this.block.to_code();
    };

    Document.prototype.prepare = function() {
      return this.each_dependency(function(dep) {
        return dep.run_prepare_blocks();
      });
    };

    Document.prototype.compileDOM = function(builder) {
      if (builder == null) builder = new TMLBuilder;
      this.run_prepare_blocks();
      this.find_method('__main__').compile(builder);
      this.current_scope().compile(builder);
      return builder;
    };

    Document.prototype.compile = function(builder, optimize) {
      if (optimize == null) optimize = true;
      return this.compileDOM(builder).root;
    };

    return Document;

  })(Base);

}).call(this);

      return exports;
    });
    
    _require['nodes/embedded_tml'] = (function() {
      var exports = this;
      _require['nodes/embedded_tml'] = function() { return exports; };
      var __dirname = './nodes';
      (function() {
  var Base, EmbeddedTML, create_dom,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Base = require('nodes/base').Base;

  create_dom = require('dom').create_dom;

  exports.EmbeddedTML = EmbeddedTML = (function(_super) {

    __extends(EmbeddedTML, _super);

    function EmbeddedTML() {
      EmbeddedTML.__super__.constructor.apply(this, arguments);
    }

    EmbeddedTML.prototype.children = function() {
      return ['tml'];
    };

    EmbeddedTML.prototype.to_code = function() {
      return "`\n" + this.tml + "\n`";
    };

    EmbeddedTML.prototype.prepare = function() {};

    EmbeddedTML.prototype.compile = function(screen) {
      var dom, traverse;
      dom = create_dom(this.tml);
      screen = screen.root.current_screen();
      traverse = function(b) {
        var attr, attrs, name, node, value, _i, _j, _len, _len2, _ref, _ref2;
        _ref = b.attrs.dom_nodes;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          node = _ref[_i];
          attrs = {
            dom_nodes: node.childNodes
          };
          if (node.attributes) {
            _ref2 = node.attributes;
            for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
              attr = _ref2[_j];
              name = attr.name;
              value = attr.value;
              attrs[name] = value;
            }
          }
          if (node.nodeName === '#text') {
            attrs.value = node.nodeValue.trim();
            if (attrs.value === "") continue;
          }
          b.b(node.nodeName.toLowerCase(), attrs, traverse);
        }
        return delete b.attrs.dom_nodes;
      };
      screen.attrs.dom_nodes = dom;
      traverse(screen);
      return "";
    };

    return EmbeddedTML;

  })(Base);

}).call(this);

      return exports;
    });
    
    _require['nodes/extension'] = (function() {
      var exports = this;
      _require['nodes/extension'] = function() { return exports; };
      var __dirname = './nodes';
      (function() {
  var Assign, Base, Extension,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __slice = Array.prototype.slice;

  Base = require('nodes/base').Base;

  Assign = require('nodes/assign').Assign;

  exports.Extension = Extension = (function(_super) {

    __extends(Extension, _super);

    function Extension() {
      Extension.__super__.constructor.apply(this, arguments);
    }

    Extension.prototype.depend = function() {
      var camel, dep, deps, match, _i, _len, _results;
      deps = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _results = [];
      for (_i = 0, _len = deps.length; _i < _len; _i++) {
        dep = deps[_i];
        camel = dep;
        while (match = /((^[a-z])|(_[a-z]))/.exec(camel)) {
          camel = camel.replace(match[1], match[1][match[1].length - 1].toUpperCase());
        }
        if (eval("typeof " + camel) === 'undefined') {
          _results.push(eval("" + camel + " = require('nodes/" + dep + "')." + camel));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Extension.prototype.require = function(builder, path) {
      var current_screen;
      current_screen = builder.root.current_screen().attrs.id;
      if (!path) throw new Error("path is required");
      this.invoke(builder, "require", path);
      return builder.root.goto(current_screen);
    };

    Extension.prototype.invoke = function() {
      var arg, args, builder, method_name, proc, self;
      builder = arguments[0], method_name = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      this.depend('literal', 'method_call', 'identifier');
      self = this;
      proc = function(arg, type) {
        if (type == null) type = Literal;
        if (arg instanceof Base) {
          return arg;
        } else {
          return self.create(type, arg);
        }
      };
      args = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = args.length; _i < _len; _i++) {
          arg = args[_i];
          _results.push(proc(arg));
        }
        return _results;
      })();
      method_name = proc(method_name, Identifier);
      return this.create(MethodCall, method_name, args).compile(builder);
    };

    Extension.prototype.method = function(name) {
      this.depend('method_reference');
      if (name instanceof Base) {
        return this.create(MethodReference, name);
      } else {
        this.depend('literal');
        return this.create(MethodReference, this.create(Literal, name));
      }
    };

    Extension.prototype.assign = function(builder, lvalue, rvalue) {
      this.depend('identifier', 'literal', 'base');
      if (!(lvalue instanceof Base)) lvalue = this.create(Identifier, lvalue);
      if (!(rvalue instanceof Base)) rvalue = this.create(Literal, rvalue);
      return this.create(Assign, lvalue, rvalue).compile(builder);
    };

    return Extension;

  })(Base);

}).call(this);

      return exports;
    });
    
    _require['nodes/for_in'] = (function() {
      var exports = this;
      _require['nodes/for_in'] = function() { return exports; };
      var __dirname = './nodes';
      (function() {
  var Extension, ForIn,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Extension = require('nodes/extension').Extension;

  exports.ForIn = ForIn = (function(_super) {

    __extends(ForIn, _super);

    function ForIn() {
      ForIn.__super__.constructor.apply(this, arguments);
    }

    ForIn.prototype.children = function() {
      return ['varid', 'expression', 'block'];
    };

    ForIn.prototype.type = function() {
      return 'string';
    };

    ForIn.prototype.to_code = function() {
      return "for " + (this.varid.to_code()) + " in " + (this.expression.to_code()) + "\n" + (this.block.to_code());
    };

    ForIn.prototype.compile = function(b) {
      var closure, current_screen;
      this.depend('range', 'closure');
      current_screen = b.root.current_screen().attrs.id;
      closure = this.create(Closure, [this.varid], this.block);
      closure.compile(b.root);
      if (this.expression instanceof Range) {
        this.require(b, "std/for_in_range");
        b.root.goto(current_screen);
        return this.invoke(b, "for_in_range", this.expression.start, this.expression.stop, this.expression.step, this.method(closure.getID()));
      } else {
        this.require(b, "std/for_in");
        b.root.goto(current_screen);
        return this.invoke(b, "for_in", this.expression, this.method(closure.getID()));
      }
    };

    return ForIn;

  })(Extension);

}).call(this);

      return exports;
    });
    
    _require['nodes/for_of'] = (function() {
      var exports = this;
      _require['nodes/for_of'] = function() { return exports; };
      var __dirname = './nodes';
      (function() {
  var Extension, ForOf,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Extension = require('nodes/extension').Extension;

  exports.ForOf = ForOf = (function(_super) {

    __extends(ForOf, _super);

    function ForOf() {
      ForOf.__super__.constructor.apply(this, arguments);
    }

    ForOf.prototype.children = function() {
      return ['varid', 'expression', 'block'];
    };

    ForOf.prototype.type = function() {
      return 'string';
    };

    ForOf.prototype.to_code = function() {
      return "for " + (this.varid.to_code()) + " of " + (this.expression.to_code()) + "\n" + (this.block.to_code());
    };

    ForOf.prototype.compile = function(b) {
      var closure, current_screen;
      this.require(b, 'std/for_of');
      this.depend('closure');
      current_screen = b.root.current_screen().attrs.id;
      closure = this.create(Closure, [this.varid], this.block);
      closure.compile(b.root);
      b.root.goto(current_screen);
      return this.invoke(b, "for_of", this.expression, 0, this.method(closure.getID()));
    };

    return ForOf;

  })(Extension);

}).call(this);

      return exports;
    });
    
    _require['nodes/identifier'] = (function() {
      var exports = this;
      _require['nodes/identifier'] = function() { return exports; };
      var __dirname = './nodes';
      (function() {
  var Base, Expression, Identifier, Literal, Variable, util,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Base = require('nodes/base').Base;

  Variable = require('variable_scope').Variable;

  Expression = require('simulator/expression').Expression;

  Literal = require('nodes/literal').Literal;

  util = require('util');

  require('simulator/all_expressions');

  exports.Identifier = Identifier = (function(_super) {

    __extends(Identifier, _super);

    function Identifier() {
      Identifier.__super__.constructor.apply(this, arguments);
    }

    Identifier.prototype.children = function() {
      return ['name'];
    };

    Identifier.prototype.type = function() {
      return this.get_dependent_variable().type();
    };

    Identifier.prototype.compile = function(b) {
      return this.get_dependent_variable();
    };

    Identifier.prototype.get_dependent_variable = function() {
      if (this.name.slice(0, 2) === '$.') {
        return new Literal($[this.name.slice(2)]);
      } else {
        return this.current_scope().lookup(this.name);
      }
    };

    Identifier.prototype.to_code = function() {
      return this.name;
    };

    Identifier.prototype.assign_value = function(setvar, val, expr_type) {
      var match, op_type, _ro, _var;
      if (expr_type == null) expr_type = null;
      _var = this.current_scope().define(this.name);
      if (val instanceof Variable) {
        _var.depends_upon(val);
        setvar.attrs.lo = "tmlvar:" + val.name;
        _var.last_known_value = val.last_known_value;
      } else if (val instanceof Literal) {
        _var.setType(val.type());
        setvar.attrs.lo = val.value;
        _var.last_known_value = val.value;
      } else if (typeof val === 'object') {
        setvar.attrs.lo = val.lo;
        if (val.lo instanceof Variable) {
          expr_type = val.lo.type();
          setvar.attrs.lo = "tmlvar:" + val.lo.name;
        }
        if (val.format !== void 0) {
          setvar.attrs.format = val.format;
        } else if (val.ro !== void 0) {
          setvar.attrs.ro = val.ro;
          setvar.attrs.op = val.op;
          if (val.ro instanceof Variable) {
            setvar.attrs.ro = "tmlvar:" + val.ro.name;
            expr_type || (expr_type = val.ro.type());
          }
        } else {
          throw new Error("Can't assign variable " + _var.name + " to no value (" + (util.inspect(val)) + ")");
        }
        if (op_type = expr_type || _var.type()) {
          _var.last_known_value = Expression.evaluate(op_type, setvar.attrs, this.current_scope().root().to_simulator_scope());
        }
      } else {
        setvar.attrs.lo = val;
        val = val.toString();
        if (val.indexOf(";") !== -1) {
          _var.setType('string');
          _var.last_known_value = val;
        } else if (match = /^tmlvar:(.*)$/.exec(val)) {
          _ro = this.current_scope().lookup(match[1]);
          if (!/^__generic_method_param_/.test(_ro.name)) _var.depends_upon(_ro);
          _var.last_known_value = _ro.last_known_value;
        } else {
          _var.last_known_value = val;
        }
      }
      return setvar;
    };

    return Identifier;

  })(Base);

}).call(this);

      return exports;
    });
    
    _require['nodes/if'] = (function() {
      var exports = this;
      _require['nodes/if'] = function() { return exports; };
      var __dirname = './nodes';
      (function() {
  var Base, If, Operation,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Base = require('nodes/base').Base;

  Operation = require('nodes/operation').Operation;

  exports.If = If = (function(_super) {

    __extends(If, _super);

    function If() {
      If.__super__.constructor.apply(this, arguments);
    }

    If.prototype.to_code = function() {
      return "if " + (this.expression.to_code()) + "\n" + (this.block.to_code()) + (this.else_block ? "\nelse\n" + (this.else_block.to_code()) : "");
    };

    If.prototype.children = function() {
      return ['expression', 'block', 'if_type'];
    };

    If.prototype.type = function() {
      return this.block.type() || this.else_block.type();
    };

    If.prototype.addElse = function(block) {
      this.else_block = block;
      this.else_block.parent = this;
      return this;
    };

    If.prototype.compile = function(builder) {
      var if_screen, op, screen;
      if (this.expression instanceof Operation) {
        op = this.expression;
      } else {
        if (this.expression.type() === 'integer') {
          op = this.create(Operation, this.expression, "not_equal", "0");
        } else {
          op = this.create(Operation, this.expression, "not_equal", "");
        }
      }
      screen = if_screen = builder.root.current_screen();
      screen = screen.branch(op.compile(screen));
      this.block.compile(screen);
      if (this.else_block) {
        if (this.else_block.nodes.length === 1 && this.else_block.nodes[0] instanceof If) {
          builder.root.goto(if_screen.attrs.id);
          this.else_block.compile(if_screen);
        } else {
          screen = screen.branch_else();
          this.else_block.compile(screen);
        }
      }
      return screen.branch_merge();
    };

    return If;

  })(Base);

}).call(this);

      return exports;
    });
    
    _require['nodes/list_index'] = (function() {
      var exports = this;
      _require['nodes/list_index'] = function() { return exports; };
      var __dirname = './nodes';
      (function() {
  var Assign, Block, Extension, ForIn, Identifier, ListIndex, Literal, Operation, Range,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Extension = require('nodes/extension').Extension;

  Operation = require('nodes/operation').Operation;

  Range = require('nodes/range').Range;

  Identifier = require('nodes/identifier').Identifier;

  Assign = require('nodes/assign').Assign;

  Literal = require('nodes/literal').Literal;

  ForIn = require('nodes/for_in').ForIn;

  Block = require('nodes/block').Block;

  exports.ListIndex = ListIndex = (function(_super) {

    __extends(ListIndex, _super);

    function ListIndex() {
      ListIndex.__super__.constructor.apply(this, arguments);
    }

    ListIndex.prototype.type = function() {
      return 'string';
    };

    ListIndex.prototype.children = function() {
      return ['list', 'index'];
    };

    ListIndex.prototype.to_code = function() {
      if (this.index instanceof Range) {
        return "" + (this.list.to_code()) + "[" + (this.index.to_code()) + "]";
      } else {
        return "" + (this.list.to_code()) + (this.index.to_code());
      }
    };

    ListIndex.prototype.compile = function(b) {
      if (this.index instanceof Range) {
        this.require(b, 'std/list_index');
        return this.invoke(b, "list_index", this.list, this.index.start, this.index.stop);
      } else {
        return this.create(Operation, this.list, 'item', this.index).compile(b);
      }
    };

    return ListIndex;

  })(Extension);

}).call(this);

      return exports;
    });
    
    _require['nodes/literal'] = (function() {
      var exports = this;
      _require['nodes/literal'] = function() { return exports; };
      var __dirname = './nodes';
      (function() {
  var Base, Literal,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Base = require('nodes/base').Base;

  exports.Literal = Literal = (function(_super) {

    __extends(Literal, _super);

    function Literal(value) {
      this.value = value;
      this.nodes = [];
    }

    Literal.prototype.type = function() {
      switch (typeof this.value) {
        case 'boolean':
        case 'string':
          return 'string';
        case 'number':
          return 'integer';
        case 'undefined':
          return 'string';
        default:
          if (this.value instanceof Array) {
            return 'string';
          } else {
            throw new Error("Untranslateable literal: " + (JSON.stringify(this.value)));
          }
      }
    };

    Literal.prototype.compile = function(builder) {
      if (this.value !== void 0) {
        if (this.value instanceof Array) {
          return this.value.join(';');
        } else {
          return this.value.toString();
        }
      } else {
        return "undefined";
      }
    };

    Literal.prototype.to_code = function() {
      return JSON.stringify(this.value);
    };

    Literal.prototype.real = function() {
      return this.value;
    };

    return Literal;

  })(Base);

}).call(this);

      return exports;
    });
    
    _require['nodes/method'] = (function() {
      var exports = this;
      _require['nodes/method'] = function() { return exports; };
      var __dirname = './nodes';
      (function() {
  var Assign, Base, Block, Identifier, If, Literal, Method, MethodReference, Operation,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Base = require('nodes/base').Base;

  Block = require('nodes/block').Block;

  If = require('nodes/if').If;

  Identifier = require('nodes/identifier').Identifier;

  MethodReference = require('nodes/method_reference').MethodReference;

  Operation = require('nodes/operation').Operation;

  Literal = require('nodes/literal').Literal;

  Assign = require('nodes/assign').Assign;

  exports.Method = Method = (function(_super) {

    __extends(Method, _super);

    function Method() {
      Method.__super__.constructor.apply(this, arguments);
    }

    Method.prototype.children = function() {
      return ['name', 'params', 'block'];
    };

    Method.prototype.instance_name = function() {
      return Method.__super__.instance_name.apply(this, arguments) + ("<" + (this.getID()) + ">");
    };

    Method.prototype.to_code = function() {
      var code, param;
      code = "" + (this.getID()) + "(" + (((function() {
        var _i, _len, _ref, _results;
        _ref = this.params;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          param = _ref[_i];
          _results.push(param.to_code());
        }
        return _results;
      }).call(this)).join(', ')) + "):";
      if (this.block) {
        return "" + code + "\n" + (this.block.to_code());
      } else {
        return code;
      }
    };

    Method.prototype.after_initialize = function() {
      this.params || (this.params = []);
      if (this.name instanceof Identifier) this.name = this.name.name;
      if (this.getID() === '__main__') {
        return this.next = "#__main__";
      } else {
        return this.next = "#__return__";
      }
    };

    Method.prototype.getID = function() {
      this.id || (this.id = this.name);
      if (this.id) {
        return this.id;
      } else {
        throw new Error("Method needs a name");
      }
    };

    Method.prototype.type = function(params) {
      return this.current_scope().define('return', null).type();
    };

    Method.prototype.current_scope = function() {
      var id;
      if (this.scope) return this.scope;
      id = this.getID();
      this.scope = Method.__super__.current_scope.call(this);
      if (id !== '__main__') this.scope = this.scope.sub(id);
      return this.scope;
    };

    Method.prototype.getReturnVariable = function() {
      return this.current_scope().define("return");
    };

    Method.prototype.prepare = function() {
      var id, param, _i, _len, _ref, _results;
      id = this.getID();
      if (this.root().methods[id]) throw new Error("Duplicate method: " + id);
      this.root().methods[id] = this;
      this.current_scope().define(".__method_params", 'string');
      _ref = this.params;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        param = _ref[_i];
        _results.push(this.current_scope().define(param.name, null));
      }
      return _results;
    };

    Method.prototype.compile = function(builder) {
      var assigns, block, index, param, previous, screen, varname, _if, _ref, _true;
      if (this.compiled) {
        throw new Error("Already compiled method " + (this.getID()) + " (" + (this.node_tree()) + ")");
      } else {
        this.compiled = true;
      }
      previous = builder.root.current_screen() || {
        attrs: {
          id: "__main__"
        }
      };
      screen = builder.root.screen(this.getID());
      screen.attrs.next = this.next;
      if (this.getID() === '__main__') {
        this.create(Assign, this.create(Identifier, ".call.stack"), this.create(Literal, "")).compile(builder);
      }
      assigns = [];
      if (this.params.length > 0) {
        for (index = 0, _ref = this.params.length; 0 <= _ref ? index < _ref : index > _ref; 0 <= _ref ? index++ : index--) {
          param = this.params[index];
          varname = ".__generic_method_param_" + index;
          this.current_scope().silently_define(".__generic_method_param_" + index, 'string');
          assigns.push(this.create(Assign, this.create(Identifier, param.name), this.create(Identifier, varname)));
        }
        block = this.create(Block, assigns);
        _true = this.create(Literal, true);
        varname = this.create(Identifier, '.__generic_method');
        this.current_scope().define('.__generic_method');
        _if = this.create(If, this.create(Operation, varname, '==', _true), block);
        builder.root.current_screen();
        _if.compile(builder.root.current_screen()).toString();
        this.create(Assign, varname, this.create(Literal, false)).compile(builder.root.current_screen());
      }
      if (this.block) this.block.compile(builder.root.current_screen());
      builder.root.goto(previous.attrs.id);
      return this.create(MethodReference, new Literal(this.getID())).compile(builder);
    };

    return Method;

  })(Base);

}).call(this);

      return exports;
    });
    
    _require['nodes/method_call'] = (function() {
      var exports = this;
      _require['nodes/method_call'] = function() { return exports; };
      var __dirname = './nodes';
      (function() {
  var Base, Document, Extension, MethodCall, NameRegistry, Variable,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __slice = Array.prototype.slice;

  NameRegistry = require('tml_builder').NameRegistry;

  Extension = require('nodes/extension').Extension;

  Document = require('nodes/document').Document;

  Base = require('nodes/base').Base;

  Variable = require('variable_scope').Variable;

  exports.MethodCall = MethodCall = (function(_super) {

    __extends(MethodCall, _super);

    function MethodCall() {
      MethodCall.__super__.constructor.apply(this, arguments);
    }

    MethodCall.prototype.children = function() {
      return ['method_name', 'params'];
    };

    MethodCall.prototype.type = function() {
      var variable;
      if (variable = this.current_scope().find(this.getMethodName())) {
        if (variable.is_method_reference()) return variable.type();
      }
      return this.root().find_method(this.getMethodName()).type(this.params);
    };

    MethodCall.prototype.getMethodName = function() {
      if (this._method_name) return this._method_name;
      return this._method_name = this.method_name.name;
    };

    MethodCall.prototype.prepare = function() {
      var prep, preps;
      if (this.getMethodName() === 'raise_warnings' || this.getMethodName() === 'silence_warnings') {
        this.current_scope()[this.getMethodName()]();
        return this.compile = function(screen) {};
      } else {
        preps = Document.preprocessors;
        if (preps && (prep = preps[this.getMethodName()])) {
          return this.compile = function(b) {
            var param, result, sys, _ref;
            result = (_ref = prep.invoke).call.apply(_ref, [this, b.root].concat(__slice.call((function() {
              var _i, _len, _ref, _results;
              _ref = this.params;
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                param = _ref[_i];
                _results.push(param.compile(b));
              }
              return _results;
            }).call(this))));
            if (result instanceof Variable || result instanceof Base) {
              this.type = function() {
                return result.type();
              };
              if (result.compile) return result.compile(b);
            } else if (typeof result === 'string') {
              this.type = function() {
                return 'string';
              };
            } else if (typeof result === 'number') {
              this.type = function() {
                return 'integer';
              };
            } else if (result === false) {
              return MethodCall.prototype.compile.call(this, b);
            } else {
              sys = require('sys');
              throw new Error("" + (this.getMethodName()) + ": return value of preprocessor invocation must be `false` to pass through, or a String, Number, Variable or compileable instance of Base (got " + (sys.inspect(result)) + ")");
            }
            return result;
          };
        }
      }
    };

    MethodCall.prototype.get_dependent_variable = function() {
      var function_screen_id, method, variable;
      function_screen_id = this.getMethodName();
      if (variable = this.current_scope().find(function_screen_id)) {
        return null;
      } else {
        method = this.root().find_method(function_screen_id);
        return method.getReturnVariable();
      }
    };

    MethodCall.prototype.to_code = function() {
      var param;
      return "" + (this.getMethodName()) + "(" + (((function() {
        var _i, _len, _ref, _results;
        _ref = this.params;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          param = _ref[_i];
          _results.push(param.to_code());
        }
        return _results;
      }).call(this)).join(', ')) + ")";
    };

    MethodCall.prototype.compile = function(builder) {
      var dest, function_screen_id, i, match, method, param, param_list, param_name, param_type, return_screen_id, screen, v, variable, _ref;
      this.depend('assign', 'identifier', 'literal');
      screen = builder.root.current_screen();
      function_screen_id = this.getMethodName();
      return_screen_id = "" + screen.attrs['id'] + "_" + (builder.root.name_registry.register(function_screen_id));
      if (variable = this.current_scope().find(function_screen_id)) {
        function_screen_id = "tmlvar:" + variable.name;
        if (variable.last_known_value && (match = /\#(.*)$/.exec(variable.last_known_value))) {
          method = this.root().find_method(match[1]);
        }
      } else {
        method = this.root().find_method(function_screen_id);
        if (this.params.length !== method.params.length) {
          throw new Error("Invalid parameter count: " + this.params.length + " for " + method.params.length);
        }
      }
      param_list = [];
      for (i = 0, _ref = this.params.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
        param = this.params[i];
        variable = param_type = null;
        if (param instanceof Identifier) {
          variable = param.get_dependent_variable();
          param_list.push("tmlvar:" + variable.name);
        } else {
          param_list.push(param.compile(screen));
          param_type = param.type();
        }
        if (method) {
          param_name = method.params[i].name;
          v = method.current_scope().define(param_name, param_type);
          if (variable) v.depends_upon(variable);
          this.assign(screen, v.name, param);
        } else {
          this.current_scope().silently_define(".__generic_method_param_" + i, 'string');
          this.assign(screen, ".__generic_method_param_" + i, param);
        }
      }
      if (!method) this.assign(screen, ".__generic_method", true);
      screen.root.current_screen().call_method(function_screen_id, return_screen_id);
      dest = screen.root.screen(return_screen_id);
      screen.attrs.next = "#" + dest.attrs.id;
      if (method) {
        return method.getReturnVariable();
      } else {
        return null;
      }
    };

    return MethodCall;

  })(Extension);

}).call(this);

      return exports;
    });
    
    _require['nodes/method_reference'] = (function() {
      var exports = this;
      _require['nodes/method_reference'] = function() { return exports; };
      var __dirname = './nodes';
      (function() {
  var Base, Identifier, MethodReference,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Base = require('nodes/base').Base;

  Identifier = require('nodes/identifier').Identifier;

  exports.MethodReference = MethodReference = (function(_super) {

    __extends(MethodReference, _super);

    function MethodReference() {
      MethodReference.__super__.constructor.apply(this, arguments);
    }

    MethodReference.prototype.children = function() {
      return ['value'];
    };

    MethodReference.prototype.type = function() {
      return "string";
    };

    MethodReference.prototype.to_code = function() {
      return ":" + (this.value.to_code());
    };

    MethodReference.prototype.compile = function(builder) {
      if (this.value instanceof Identifier) {
        return "#" + this.value.name;
      } else {
        return "#" + (this.value.compile(builder));
      }
    };

    return MethodReference;

  })(Base);

}).call(this);

      return exports;
    });
    
    _require['nodes/operation'] = (function() {
      var exports = this;
      _require['nodes/operation'] = function() { return exports; };
      var __dirname = './nodes';
      (function() {
  var Assign, Base, Identifier, Operation, Variable,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Base = require('nodes/base').Base;

  Identifier = require('nodes/identifier').Identifier;

  Assign = require('nodes/assign').Assign;

  Variable = require("variable_scope").Variable;

  exports.Operation = Operation = (function(_super) {

    __extends(Operation, _super);

    function Operation() {
      Operation.__super__.constructor.apply(this, arguments);
    }

    Operation.prototype.children = function() {
      return ['lvalue', 'op', 'rvalue'];
    };

    Operation.prototype.type = function() {
      if (this.lvalue instanceof Identifier && this.lvalue.name === ".__method_params") {
        return null;
      }
      return this.lvalue.type() || this.rvalue.type();
    };

    Operation.prototype.to_code = function() {
      if (this.rvalue) {
        return "" + (this.lvalue.to_code()) + " " + this.op + " " + (this.rvalue.to_code());
      } else {
        return this.lvalue.to_code();
      }
    };

    Operation.prototype.get_dependent_variable = function() {
      if (this.lvalue instanceof Base) {
        return this.lvalue.get_dependent_variable();
      } else if (this.lvalue instanceof Variable) {
        return this.lvalue;
      } else {
        return null;
      }
    };

    Operation.prototype.prepare = function() {
      var _ref;
      if (this.op && this.op.indexOf(">") !== -1) {
        _ref = [this.rvalue, this.lvalue], this.lvalue = _ref[0], this.rvalue = _ref[1];
        if (this.op.indexOf('=' !== -1)) {
          return this.op = '<=';
        } else {
          return this.op = '<';
        }
      }
    };

    Operation.prototype.compile = function(screen) {
      var depth, lval, proc, result, result_variable, rval, self, setvar, _ref;
      self = this;
      proc = function(w, val) {
        var id, _v;
        if (val instanceof Operation) {
          id = self.create(Identifier, "__tmp" + w);
          self.create(Assign, id, val).compile(screen);
          return "tmlvar:" + id.get_dependent_variable().name;
        } else if (val instanceof Identifier) {
          return "tmlvar:" + val.get_dependent_variable().name;
        } else if (val instanceof Variable) {
          return "tmlvar:" + val.name;
        } else {
          _v = val.compile(screen);
          if (_v instanceof Variable) {
            return "tmlvar:" + _v.name;
          } else {
            return _v;
          }
        }
      };
      lval = proc('l', this.lvalue);
      if (!this.rvalue) return lval;
      rval = proc('r', this.rvalue);
      result = {
        lo: lval,
        ro: rval,
        op: (function() {
          switch (this.op) {
            case '+':
              return 'plus';
            case '-':
              return 'minus';
            case '==':
              return 'equal';
            case '!=':
              return 'not_equal';
            case '<=':
              return 'less_or_equal';
            case '<':
              return 'less';
            default:
              return this.op;
          }
        }).call(this)
      };
      if (this.op === '%') {
        result.format = result.ro;
        delete result.ro;
        delete result.op;
      }
      if (result.op && ((_ref = result.op) === 'equal' || _ref === 'not_equal' || _ref === 'less' || _ref === 'less_or_equal')) {
        return result;
      }
      depth = this.depth();
      result_variable = this.current_scope().define(".tmp." + (this.type()) + ".op" + depth, this.type());
      setvar = screen.root.current_screen().b('setvar', {
        name: result_variable.name
      });
      this.create(Identifier, result_variable.name).assign_value(setvar, result);
      return result_variable;
    };

    return Operation;

  })(Base);

}).call(this);

      return exports;
    });
    
    _require['nodes/parens'] = (function() {
      var exports = this;
      _require['nodes/parens'] = function() { return exports; };
      var __dirname = './nodes';
      (function() {
  var Assign, Base, Identifier, Operation, Parens,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __slice = Array.prototype.slice;

  Base = require('nodes/base').Base;

  Identifier = require('nodes/identifier').Identifier;

  Assign = require('nodes/assign').Assign;

  Operation = require('nodes/operation').Operation;

  exports.Parens = Parens = (function(_super) {

    __extends(Parens, _super);

    function Parens() {
      Parens.__super__.constructor.apply(this, arguments);
    }

    Parens.prototype.prepare = function() {
      this.op = this.create.apply(this, [Operation].concat(__slice.call(this.nodes)));
      this.id = this.create(Identifier, '__tmpvar');
      return this.assign = this.create(Assign, this.id, this.op);
    };

    Parens.prototype.type = function() {
      return this.assign.type();
    };

    Parens.prototype.to_code = function() {
      return "(" + (this.op.to_code()) + ")";
    };

    Parens.prototype.compile = function(b) {
      this.assign.compile(b);
      return "tmlvar:" + this.id.get_dependent_variable().name;
    };

    return Parens;

  })(Base);

}).call(this);

      return exports;
    });
    
    _require['nodes/property_access'] = (function() {
      var exports = this;
      _require['nodes/property_access'] = function() { return exports; };
      var __dirname = './nodes';
      (function() {
  var Base, Identifier, PropertyAccess,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Base = require('nodes/base').Base;

  Identifier = require('nodes/identifier').Identifier;

  exports.PropertyAccess = PropertyAccess = (function(_super) {

    __extends(PropertyAccess, _super);

    function PropertyAccess() {
      PropertyAccess.__super__.constructor.apply(this, arguments);
    }

    PropertyAccess.prototype.to_code = function() {
      return "" + (this.source.to_code()) + "." + (this.property_name.to_code());
    };

    PropertyAccess.prototype.children = function() {
      return ['source', 'property_name'];
    };

    PropertyAccess.prototype.type = function() {
      return this.result().type();
    };

    PropertyAccess.prototype.result = function() {
      var fail, self;
      self = this;
      fail = function() {
        var property_name, source_name;
        source_name = self.source.__proto__.constructor.name;
        property_name = self.property_name.__proto__.constructor.name;
        throw new Error("Don't know what to do with PropertyAccess(" + source_name + ", " + property_name + ")");
      };
      if (this.source instanceof Identifier) {
        console.log(this.source.get_dependent_variable());
      }
      return fail();
    };

    PropertyAccess.prototype.compile = function(b) {
      return this.result().compile(b);
    };

    return PropertyAccess;

  })(Base);

}).call(this);

      return exports;
    });
    
    _require['nodes/range'] = (function() {
      var exports = this;
      _require['nodes/range'] = function() { return exports; };
      var __dirname = './nodes';
      (function() {
  var Base, Literal, Operation, Parens, Range,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Base = require('nodes/base').Base;

  Literal = require('nodes/literal').Literal;

  Operation = require('nodes/operation').Operation;

  Parens = require('nodes/parens').Parens;

  exports.Range = Range = (function(_super) {

    __extends(Range, _super);

    function Range(start, stop, inclusive) {
      this.start = start;
      this.stop = stop;
      this.inclusive = inclusive != null ? inclusive : true;
      Range.__super__.constructor.call(this);
      if (!this.inclusive) {
        this.stop = this.create(Parens, this.create(Operation, this.stop, "-", this.create(Literal, 1)));
      }
    }

    Range.prototype.to_code = function() {
      return "[" + (this.start.to_code()) + ".." + (this.stop.to_code()) + "]";
    };

    Range.prototype.prepare = function() {
      return this.step = this.create(Literal, 1);
    };

    Range.prototype.type = function() {
      return 'integer';
    };

    Range.prototype.compile = function(b) {};

    return Range;

  })(Base);

}).call(this);

      return exports;
    });
    
    _require['nodes/return'] = (function() {
      var exports = this;
      _require['nodes/return'] = function() { return exports; };
      var __dirname = './nodes';
      (function() {
  var Assign, Base, Identifier, Literal, Return,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Base = require('nodes/base').Base;

  Identifier = require('nodes/identifier').Identifier;

  Literal = require('nodes/literal').Literal;

  Assign = require('nodes/assign').Assign;

  exports.Return = Return = (function(_super) {

    __extends(Return, _super);

    function Return() {
      Return.__super__.constructor.apply(this, arguments);
    }

    Return.prototype.children = function() {
      return ['expression'];
    };

    Return.prototype.to_code = function() {
      return "return " + (this.expression ? this.expression.to_code() : "");
    };

    Return.prototype.type = function() {
      if (this.expression) {
        return this.expression.type();
      } else {
        return null;
      }
    };

    Return.prototype["with"] = function(expr) {
      this.expression = expr;
      this.expression.parent = this;
      return this;
    };

    Return.prototype.compile = function(builder) {
      var assignment, current, dependent, next, screen_id, type, v;
      screen_id = builder.attrs.id;
      this.expression || (this.expression = this.create(Literal, ""));
      assignment = this.create(Assign, this.create(Identifier, "return"), this.expression).compile(builder);
      if (type = this.expression.type()) {
        v = this.current_scope().define("return", this.expression.type());
      } else {
        v = this.current_scope().define("return");
        dependent = this.expression.get_dependent_variable();
        v.depends_upon(dependent);
      }
      current = builder.root.current_screen();
      if (current.attrs['id'] !== '__main__') {
        if (next = current.first('next')) {
          next.attrs.uri = '#__return__';
        } else {
          current.attrs.next = '#__return__';
        }
      }
      return assignment;
    };

    return Return;

  })(Base);

}).call(this);

      return exports;
    });
    
    _require['nodes/switch'] = (function() {
      var exports = this;
      _require['nodes/switch'] = function() { return exports; };
      var __dirname = './nodes';
      (function() {
  var Block, Extension, Identifier, Switch,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Extension = require('nodes/extension').Extension;

  Block = require('nodes/block').Block;

  Identifier = require('nodes/identifier').Identifier;

  exports.Switch = Switch = (function(_super) {

    __extends(Switch, _super);

    function Switch() {
      Switch.__super__.constructor.apply(this, arguments);
    }

    Switch.prototype.to_code = function() {
      var header, whens, _else, _when;
      header = "switch " + (this.expression.to_code()) + "\n";
      whens = (function() {
        var _i, _len, _ref, _results;
        _ref = this.whens;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          _when = _ref[_i];
          _results.push("  when " + (_when[0].to_code()) + "\n" + (this.indent(_when[1])));
        }
        return _results;
      }).call(this);
      _else = (this.else_block ? "\n  else\n" + (this.indent(this.else_block)) : "");
      return header + whens.join("\n") + _else;
    };

    Switch.prototype.children = function() {
      return ['expression', 'whens', 'else_block'];
    };

    Switch.prototype.type = function() {
      return this.expression.type();
    };

    Switch.prototype.prepare = function() {
      var new_if, _i, _if, _len, _ref, _when;
      this.depend('if', 'operation');
      this.actual_value = this.create(Identifier, 'switch.actual_value');
      this._if = _if = null;
      _ref = this.whens;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        _when = _ref[_i];
        new_if = this.create(If, this.create(Operation, this.actual_value, '==', _when[0]), _when[1], 'if');
        if (this._if) {
          _if.addElse(this.create(Block, [new_if]));
          _if = new_if;
        } else {
          this._if = _if = new_if;
        }
      }
      if (this.else_block) return _if.addElse(this.else_block);
    };

    Switch.prototype.compile = function(b) {
      this.assign(b, this.actual_value, this.expression);
      return this._if.compile(b.root.current_screen());
    };

    return Switch;

  })(Extension);

}).call(this);

      return exports;
    });
    
    _require['nodes/throw'] = (function() {
      var exports = this;
      _require['nodes/throw'] = function() { return exports; };
      var __dirname = './nodes';
      (function() {
  var Extension, Throw,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Extension = require('nodes/extension').Extension;

  exports.Throw = Throw = (function(_super) {

    __extends(Throw, _super);

    function Throw() {
      Throw.__super__.constructor.apply(this, arguments);
    }

    Throw.prototype.children = function() {
      return ['expression'];
    };

    Throw.prototype.to_code = function() {
      return "throw " + (this.expression.to_code());
    };

    Throw.prototype.compile = function(b) {
      this.require(b, 'std/throw');
      return this.invoke(b, 'throw_error', this.expression);
    };

    return Throw;

  })(Extension);

}).call(this);

      return exports;
    });
    
    _require['parser'] = (function() {
      var exports = this;
      _require['parser'] = function() { return exports; };
      var __dirname = './.';
      /* Jison generated parser */

var parser = (function(){
undefined
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"Root":3,"Body":4,"Method":5,"Identifier":6,":":7,"Block":8,"Line":9,"CALL_START":10,"ParamList":11,"CALL_END":12,"IDENTIFIER":13,".":14,"Expression":15,"Statement":16,"TERMINATOR":17,"INDENT":18,"OUTDENT":19,"IfBlock":20,"IF":21,"ELSE":22,"If":23,"POST_IF":24,"Literal":25,"NUMBER":26,"STRING":27,"BOOL":28,"Value":29,"Parenthetical":30,"ListIndex":31,"Assign":32,"MethodCall":33,"Operation":34,"ForIn":35,"ForOf":36,"Closure":37,"Range":38,"Array":39,"INDEX_START":40,"INDEX_END":41,"..":42,"...":43,"[":44,"]":45,"ArgList":46,"OptComma":47,"Arg":48,",":49,"->":50,"PARAM_START":51,"PARAM_END":52,"Return":53,"Switch":54,"THROW":55,"JS":56,"SWITCH":57,"Whens":58,"When":59,"LEADING_WHEN":60,"RETURN":61,"FOR":62,"FORIN":63,"FOROF":64,"(":65,")":66,"-":67,"++":68,"--":69,"COMPOUND_ASSIGN":70,"MATH":71,"+":72,"COMPARE":73,"=":74,"Param":75,"$accept":0,"$end":1},
terminals_: {2:"error",7:":",10:"CALL_START",12:"CALL_END",13:"IDENTIFIER",14:".",17:"TERMINATOR",18:"INDENT",19:"OUTDENT",21:"IF",22:"ELSE",24:"POST_IF",26:"NUMBER",27:"STRING",28:"BOOL",40:"INDEX_START",41:"INDEX_END",42:"..",43:"...",44:"[",45:"]",49:",",50:"->",51:"PARAM_START",52:"PARAM_END",55:"THROW",56:"JS",57:"SWITCH",60:"LEADING_WHEN",61:"RETURN",62:"FOR",63:"FORIN",64:"FOROF",65:"(",66:")",67:"-",68:"++",69:"--",70:"COMPOUND_ASSIGN",71:"MATH",72:"+",73:"COMPARE",74:"="},
productions_: [0,[3,1],[3,0],[5,2],[5,3],[5,3],[5,5],[5,6],[5,6],[6,1],[6,2],[6,3],[9,1],[9,1],[9,1],[4,1],[4,3],[4,2],[8,2],[8,3],[20,3],[20,5],[23,1],[23,3],[23,3],[23,3],[25,1],[25,1],[25,1],[29,1],[29,1],[15,1],[15,1],[15,1],[15,2],[15,1],[15,1],[15,1],[15,1],[15,1],[15,1],[15,1],[15,1],[31,4],[31,6],[31,6],[39,2],[39,4],[46,1],[46,3],[46,4],[46,4],[46,6],[48,1],[47,0],[47,1],[38,5],[38,5],[37,2],[37,5],[37,4],[16,1],[16,1],[16,1],[16,2],[16,1],[54,5],[54,7],[58,1],[58,2],[59,3],[59,4],[53,2],[53,1],[35,5],[36,5],[30,3],[30,5],[33,4],[33,3],[34,2],[34,2],[34,2],[34,3],[34,3],[34,3],[34,3],[34,3],[32,3],[32,5],[32,5],[11,1],[11,3],[75,1]],
performAction: function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$) {

var $0 = $$.length - 1;
switch (yystate) {
case 1:return this.$ = new yy.Document(yy.Block.wrap([new yy.Method(new yy.Identifier('__main__'), [], $$[$0])]));
break;
case 2:return this.$ = new yy.Document(yy.Block.wrap([new yy.Method(new yy.Identifier('__main__'), [], yy.Block.wrap([]))]));
break;
case 3:this.$ = new yy.Method($$[$0-1], []);
break;
case 4:this.$ = new yy.Method($$[$0-2], [], $$[$0]);
break;
case 5:this.$ = new yy.Method($$[$0-2], [], yy.Block.wrap([$$[$0]]));
break;
case 6:this.$ = new yy.Method($$[$0-4], $$[$0-2], new yy.Block);
break;
case 7:this.$ = new yy.Method($$[$0-5], $$[$0-3], $$[$0]);
break;
case 8:this.$ = new yy.Method($$[$0-5], $$[$0-3], yy.Block.wrap([$$[$0]]));
break;
case 9:this.$ = new yy.Identifier($$[$0]);
break;
case 10:this.$ = (function () {
        $$[$0].name = "." + $$[$0].name;
        return $$[$0];
      }());
break;
case 11:this.$ = (function () {
        $$[$0-2].name += "." + $$[$0].name;
        return $$[$0-2];
      }());
break;
case 12:this.$ = $$[$0];
break;
case 13:this.$ = $$[$0];
break;
case 14:this.$ = $$[$0];
break;
case 15:this.$ = yy.Block.wrap([$$[$0]]);
break;
case 16:this.$ = (function () {
        $$[$0-2].push($$[$0]);
        return $$[$0-2];
      }());
break;
case 17:this.$ = $$[$0-1];
break;
case 18:this.$ = new yy.Block;
break;
case 19:this.$ = $$[$0-1];
break;
case 20:this.$ = new yy.If($$[$0-1], $$[$0], $$[$0-2]);
break;
case 21:this.$ = $$[$0-4].addElse(new yy.If($$[$0-1], $$[$0], $$[$0-2]));
break;
case 22:this.$ = $$[$0];
break;
case 23:this.$ = $$[$0-2].addElse($$[$0]);
break;
case 24:this.$ = new yy.If($$[$0], yy.Block.wrap([$$[$0-2]]), $$[$0-1]);
break;
case 25:this.$ = new yy.If($$[$0], yy.Block.wrap([$$[$0-2]]), $$[$0-1]);
break;
case 26:this.$ = new yy.Literal(eval($$[$0]));
break;
case 27:this.$ = new yy.Literal(eval($$[$0]));
break;
case 28:this.$ = new yy.Literal(eval($$[$0]));
break;
case 29:this.$ = $$[$0];
break;
case 30:this.$ = $$[$0];
break;
case 31:this.$ = $$[$0];
break;
case 32:this.$ = $$[$0];
break;
case 33:this.$ = $$[$0];
break;
case 34:this.$ = new yy.MethodReference($$[$0]);
break;
case 35:this.$ = $$[$0];
break;
case 36:this.$ = $$[$0];
break;
case 37:this.$ = $$[$0];
break;
case 38:this.$ = $$[$0];
break;
case 39:this.$ = $$[$0];
break;
case 40:this.$ = $$[$0];
break;
case 41:this.$ = $$[$0];
break;
case 42:this.$ = $$[$0];
break;
case 43:this.$ = new yy.ListIndex($$[$0-3], $$[$0-1]);
break;
case 44:this.$ = new yy.ListIndex($$[$0-5], new yy.Range($$[$0-3], $$[$0-1]));
break;
case 45:this.$ = new yy.ListIndex($$[$0-5], new yy.Range($$[$0-3], $$[$0-1], false));
break;
case 46:this.$ = new yy.Array([]);
break;
case 47:this.$ = new yy.Array($$[$0-2]);
break;
case 48:this.$ = [$$[$0]];
break;
case 49:this.$ = $$[$0-2].concat($$[$0]);
break;
case 50:this.$ = $$[$0-3].concat($$[$0]);
break;
case 51:this.$ = $$[$0-2];
break;
case 52:this.$ = $$[$0-5].concat($$[$0-2]);
break;
case 53:this.$ = $$[$0];
break;
case 54:this.$ = $$[$0];
break;
case 55:this.$ = $$[$0];
break;
case 56:this.$ = new yy.Range($$[$0-3], $$[$0-1]);
break;
case 57:this.$ = new yy.Range($$[$0-3], $$[$0-1], false);
break;
case 58:this.$ = new yy.Closure([], $$[$0]);
break;
case 59:this.$ = new yy.Closure($$[$0-3], $$[$0]);
break;
case 60:this.$ = new yy.Closure([], $$[$0]);
break;
case 61:this.$ = $$[$0];
break;
case 62:this.$ = $$[$0];
break;
case 63:this.$ = $$[$0];
break;
case 64:this.$ = new yy.Throw($$[$0]);
break;
case 65:this.$ = new yy.EmbeddedTML($$[$0]);
break;
case 66:this.$ = new yy.Switch($$[$0-3], $$[$0-1]);
break;
case 67:this.$ = new yy.Switch($$[$0-5], $$[$0-3], $$[$0-1]);
break;
case 68:this.$ = $$[$0];
break;
case 69:this.$ = $$[$0-1].concat($$[$0]);
break;
case 70:this.$ = [[$$[$0-1], $$[$0]]];
break;
case 71:this.$ = [[$$[$0-2], $$[$0-1]]];
break;
case 72:this.$ = new yy.Return($$[$0]);
break;
case 73:this.$ = new yy.Return;
break;
case 74:this.$ = new yy.ForIn($$[$0-3], $$[$0-1], $$[$0]);
break;
case 75:this.$ = new yy.ForOf($$[$0-3], $$[$0-1], $$[$0]);
break;
case 76:this.$ = new yy.Parens($$[$0-1]);
break;
case 77:this.$ = new yy.Parens($$[$0-2]);
break;
case 78:this.$ = new yy.MethodCall($$[$0-3], $$[$0-1]);
break;
case 79:this.$ = new yy.MethodCall($$[$0-2], []);
break;
case 80:this.$ = new yy.Operation(new yy.Literal(0), '-', $$[$0]);
break;
case 81:this.$ = new yy.Assign($$[$0-1], new yy.Operation($$[$0-1], '+', new yy.Literal(1)));
break;
case 82:this.$ = new yy.Assign($$[$0-1], new yy.Operation($$[$0-1], '-', new yy.Literal(1)));
break;
case 83:this.$ = new yy.Assign($$[$0-2], new yy.Operation($$[$0-2], $$[$0-1][0], $$[$0]));
break;
case 84:this.$ = new yy.Operation($$[$0-2], $$[$0-1], $$[$0]);
break;
case 85:this.$ = new yy.Operation($$[$0-2], $$[$0-1], $$[$0]);
break;
case 86:this.$ = new yy.Operation($$[$0-2], $$[$0-1], $$[$0]);
break;
case 87:this.$ = new yy.Operation($$[$0-2], $$[$0-1], $$[$0]);
break;
case 88:this.$ = new yy.Assign($$[$0-2], $$[$0]);
break;
case 89:this.$ = new yy.Assign($$[$0-4], $$[$0-1]);
break;
case 90:this.$ = new yy.Assign($$[$0-4], $$[$0]);
break;
case 91:this.$ = [$$[$0]];
break;
case 92:this.$ = $$[$0-2].concat([$$[$0]]);
break;
case 93:this.$ = $$[$0];
break;
}
},
table: [{1:[2,2],3:1,4:2,5:4,6:7,7:[1,10],9:3,13:[1,24],14:[1,25],15:5,16:6,20:33,21:[1,40],23:19,25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],50:[1,30],51:[1,31],53:20,54:21,55:[1,22],56:[1,23],57:[1,35],61:[1,34],62:[1,29],65:[1,39],67:[1,28]},{1:[3]},{1:[2,1],17:[1,41]},{1:[2,15],17:[2,15],19:[2,15]},{1:[2,12],17:[2,12],19:[2,12]},{1:[2,13],17:[2,13],19:[2,13],24:[1,46],67:[1,44],71:[1,42],72:[1,43],73:[1,45]},{1:[2,14],17:[2,14],19:[2,14],24:[1,47]},{1:[2,31],7:[1,48],10:[1,49],14:[1,50],17:[2,31],19:[2,31],24:[2,31],40:[1,51],67:[2,31],68:[1,53],69:[1,54],70:[1,55],71:[2,31],72:[2,31],73:[2,31],74:[1,52]},{1:[2,32],12:[2,32],17:[2,32],18:[2,32],19:[2,32],24:[2,32],41:[2,32],42:[2,32],43:[2,32],45:[2,32],49:[2,32],52:[2,32],66:[2,32],67:[2,32],71:[2,32],72:[2,32],73:[2,32]},{1:[2,33],12:[2,33],17:[2,33],18:[2,33],19:[2,33],24:[2,33],41:[2,33],42:[2,33],43:[2,33],45:[2,33],49:[2,33],52:[2,33],66:[2,33],67:[2,33],71:[2,33],72:[2,33],73:[2,33]},{6:57,7:[1,10],13:[1,24],14:[1,25],15:56,25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],50:[1,30],51:[1,31],62:[1,29],65:[1,39],67:[1,28]},{1:[2,35],12:[2,35],17:[2,35],18:[2,35],19:[2,35],24:[2,35],41:[2,35],42:[2,35],43:[2,35],45:[2,35],49:[2,35],52:[2,35],66:[2,35],67:[2,35],71:[2,35],72:[2,35],73:[2,35]},{1:[2,36],12:[2,36],17:[2,36],18:[2,36],19:[2,36],24:[2,36],41:[2,36],42:[2,36],43:[2,36],45:[2,36],49:[2,36],52:[2,36],66:[2,36],67:[2,36],71:[2,36],72:[2,36],73:[2,36]},{1:[2,37],12:[2,37],17:[2,37],18:[2,37],19:[2,37],24:[2,37],41:[2,37],42:[2,37],43:[2,37],45:[2,37],49:[2,37],52:[2,37],66:[2,37],67:[2,37],71:[2,37],72:[2,37],73:[2,37]},{1:[2,38],12:[2,38],17:[2,38],18:[2,38],19:[2,38],24:[2,38],41:[2,38],42:[2,38],43:[2,38],45:[2,38],49:[2,38],52:[2,38],66:[2,38],67:[2,38],71:[2,38],72:[2,38],73:[2,38]},{1:[2,39],12:[2,39],17:[2,39],18:[2,39],19:[2,39],24:[2,39],41:[2,39],42:[2,39],43:[2,39],45:[2,39],49:[2,39],52:[2,39],66:[2,39],67:[2,39],71:[2,39],72:[2,39],73:[2,39]},{1:[2,40],12:[2,40],17:[2,40],18:[2,40],19:[2,40],24:[2,40],41:[2,40],42:[2,40],43:[2,40],45:[2,40],49:[2,40],52:[2,40],66:[2,40],67:[2,40],71:[2,40],72:[2,40],73:[2,40]},{1:[2,41],12:[2,41],17:[2,41],18:[2,41],19:[2,41],24:[2,41],41:[2,41],42:[2,41],43:[2,41],45:[2,41],49:[2,41],52:[2,41],66:[2,41],67:[2,41],71:[2,41],72:[2,41],73:[2,41]},{1:[2,42],12:[2,42],17:[2,42],18:[2,42],19:[2,42],24:[2,42],41:[2,42],42:[2,42],43:[2,42],45:[2,42],49:[2,42],52:[2,42],66:[2,42],67:[2,42],71:[2,42],72:[2,42],73:[2,42]},{1:[2,61],17:[2,61],19:[2,61],24:[2,61]},{1:[2,62],17:[2,62],19:[2,62],24:[2,62]},{1:[2,63],17:[2,63],19:[2,63],24:[2,63]},{6:57,7:[1,10],13:[1,24],14:[1,25],15:58,25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],50:[1,30],51:[1,31],62:[1,29],65:[1,39],67:[1,28]},{1:[2,65],17:[2,65],19:[2,65],24:[2,65]},{1:[2,9],7:[2,9],10:[2,9],12:[2,9],14:[2,9],17:[2,9],18:[2,9],19:[2,9],24:[2,9],40:[2,9],41:[2,9],42:[2,9],43:[2,9],45:[2,9],49:[2,9],52:[2,9],63:[2,9],64:[2,9],66:[2,9],67:[2,9],68:[2,9],69:[2,9],70:[2,9],71:[2,9],72:[2,9],73:[2,9],74:[2,9]},{6:59,13:[1,24],14:[1,25]},{1:[2,29],12:[2,29],17:[2,29],18:[2,29],19:[2,29],24:[2,29],41:[2,29],42:[2,29],43:[2,29],45:[2,29],49:[2,29],52:[2,29],66:[2,29],67:[2,29],71:[2,29],72:[2,29],73:[2,29]},{1:[2,30],12:[2,30],17:[2,30],18:[2,30],19:[2,30],24:[2,30],41:[2,30],42:[2,30],43:[2,30],45:[2,30],49:[2,30],52:[2,30],66:[2,30],67:[2,30],71:[2,30],72:[2,30],73:[2,30]},{6:57,7:[1,10],13:[1,24],14:[1,25],15:60,25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],50:[1,30],51:[1,31],62:[1,29],65:[1,39],67:[1,28]},{6:61,13:[1,24],14:[1,25]},{8:62,18:[1,63]},{6:57,7:[1,10],11:64,13:[1,24],14:[1,25],15:67,25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],50:[1,30],51:[1,31],52:[1,65],62:[1,29],65:[1,39],67:[1,28],75:66},{6:57,7:[1,10],13:[1,24],14:[1,25],15:68,18:[1,72],25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],45:[1,69],46:70,48:71,50:[1,30],51:[1,31],62:[1,29],65:[1,39],67:[1,28]},{1:[2,22],17:[2,22],19:[2,22],22:[1,73],24:[2,22]},{1:[2,73],6:57,7:[1,10],13:[1,24],14:[1,25],15:74,17:[2,73],19:[2,73],24:[2,73],25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],50:[1,30],51:[1,31],62:[1,29],65:[1,39],67:[1,28]},{6:57,7:[1,10],13:[1,24],14:[1,25],15:75,25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],50:[1,30],51:[1,31],62:[1,29],65:[1,39],67:[1,28]},{1:[2,26],12:[2,26],17:[2,26],18:[2,26],19:[2,26],24:[2,26],41:[2,26],42:[2,26],43:[2,26],45:[2,26],49:[2,26],52:[2,26],66:[2,26],67:[2,26],71:[2,26],72:[2,26],73:[2,26]},{1:[2,27],12:[2,27],17:[2,27],18:[2,27],19:[2,27],24:[2,27],41:[2,27],42:[2,27],43:[2,27],45:[2,27],49:[2,27],52:[2,27],66:[2,27],67:[2,27],71:[2,27],72:[2,27],73:[2,27]},{1:[2,28],12:[2,28],17:[2,28],18:[2,28],19:[2,28],24:[2,28],41:[2,28],42:[2,28],43:[2,28],45:[2,28],49:[2,28],52:[2,28],66:[2,28],67:[2,28],71:[2,28],72:[2,28],73:[2,28]},{6:57,7:[1,10],13:[1,24],14:[1,25],15:76,18:[1,77],25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],50:[1,30],51:[1,31],62:[1,29],65:[1,39],67:[1,28]},{6:57,7:[1,10],13:[1,24],14:[1,25],15:78,25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],50:[1,30],51:[1,31],62:[1,29],65:[1,39],67:[1,28]},{1:[2,17],5:4,6:7,7:[1,10],9:79,13:[1,24],14:[1,25],15:5,16:6,17:[2,17],19:[2,17],20:33,21:[1,40],23:19,25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],50:[1,30],51:[1,31],53:20,54:21,55:[1,22],56:[1,23],57:[1,35],61:[1,34],62:[1,29],65:[1,39],67:[1,28]},{6:57,7:[1,10],13:[1,24],14:[1,25],15:80,25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],50:[1,30],51:[1,31],62:[1,29],65:[1,39],67:[1,28]},{6:57,7:[1,10],13:[1,24],14:[1,25],15:81,25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],50:[1,30],51:[1,31],62:[1,29],65:[1,39],67:[1,28]},{6:57,7:[1,10],13:[1,24],14:[1,25],15:82,25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],50:[1,30],51:[1,31],62:[1,29],65:[1,39],67:[1,28]},{6:57,7:[1,10],13:[1,24],14:[1,25],15:83,25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],50:[1,30],51:[1,31],62:[1,29],65:[1,39],67:[1,28]},{6:57,7:[1,10],13:[1,24],14:[1,25],15:84,25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],50:[1,30],51:[1,31],62:[1,29],65:[1,39],67:[1,28]},{6:57,7:[1,10],13:[1,24],14:[1,25],15:85,25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],50:[1,30],51:[1,31],62:[1,29],65:[1,39],67:[1,28]},{1:[2,3],5:4,6:7,7:[1,10],8:86,9:87,13:[1,24],14:[1,25],15:5,16:6,17:[2,3],18:[1,63],19:[2,3],20:33,21:[1,40],23:19,25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],50:[1,30],51:[1,31],53:20,54:21,55:[1,22],56:[1,23],57:[1,35],61:[1,34],62:[1,29],65:[1,39],67:[1,28]},{6:57,7:[1,10],11:88,12:[1,90],13:[1,24],14:[1,25],15:67,25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],50:[1,30],51:[1,31],62:[1,29],65:[1,39],67:[1,28],74:[1,89],75:66},{6:91,13:[1,24],14:[1,25]},{6:57,7:[1,10],13:[1,24],14:[1,25],15:92,25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],50:[1,30],51:[1,31],62:[1,29],65:[1,39],67:[1,28]},{6:57,7:[1,10],13:[1,24],14:[1,25],15:93,18:[1,94],25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],50:[1,30],51:[1,31],62:[1,29],65:[1,39],67:[1,28]},{1:[2,81],12:[2,81],17:[2,81],18:[2,81],19:[2,81],24:[2,81],41:[2,81],42:[2,81],43:[2,81],45:[2,81],49:[2,81],52:[2,81],66:[2,81],67:[2,81],71:[2,81],72:[2,81],73:[2,81]},{1:[2,82],12:[2,82],17:[2,82],18:[2,82],19:[2,82],24:[2,82],41:[2,82],42:[2,82],43:[2,82],45:[2,82],49:[2,82],52:[2,82],66:[2,82],67:[2,82],71:[2,82],72:[2,82],73:[2,82]},{6:57,7:[1,10],13:[1,24],14:[1,25],15:95,25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],50:[1,30],51:[1,31],62:[1,29],65:[1,39],67:[1,28]},{1:[2,34],12:[2,34],17:[2,34],18:[2,34],19:[2,34],24:[2,34],41:[2,34],42:[2,34],43:[2,34],45:[2,34],49:[2,34],52:[2,34],66:[2,34],67:[1,44],71:[1,42],72:[1,43],73:[1,45]},{1:[2,31],10:[1,96],12:[2,31],14:[1,50],17:[2,31],18:[2,31],19:[2,31],24:[2,31],40:[1,51],41:[2,31],42:[2,31],43:[2,31],45:[2,31],49:[2,31],52:[2,31],66:[2,31],67:[2,31],68:[1,53],69:[1,54],70:[1,55],71:[2,31],72:[2,31],73:[2,31],74:[1,52]},{1:[2,64],17:[2,64],19:[2,64],24:[2,64],67:[1,44],71:[1,42],72:[1,43],73:[1,45]},{1:[2,10],7:[2,10],10:[2,10],12:[2,10],14:[2,10],17:[2,10],18:[2,10],19:[2,10],24:[2,10],40:[2,10],41:[2,10],42:[2,10],43:[2,10],45:[2,10],49:[2,10],52:[2,10],63:[2,10],64:[2,10],66:[2,10],67:[2,10],68:[2,10],69:[2,10],70:[2,10],71:[2,10],72:[2,10],73:[2,10],74:[2,10]},{1:[2,80],12:[2,80],17:[2,80],18:[2,80],19:[2,80],24:[2,80],41:[2,80],42:[2,80],43:[2,80],45:[2,80],49:[2,80],52:[2,80],66:[2,80],67:[2,80],71:[1,42],72:[2,80],73:[2,80]},{14:[1,50],63:[1,97],64:[1,98]},{1:[2,58],12:[2,58],17:[2,58],18:[2,58],19:[2,58],24:[2,58],41:[2,58],42:[2,58],43:[2,58],45:[2,58],49:[2,58],52:[2,58],66:[2,58],67:[2,58],71:[2,58],72:[2,58],73:[2,58]},{4:100,5:4,6:7,7:[1,10],9:3,13:[1,24],14:[1,25],15:5,16:6,19:[1,99],20:33,21:[1,40],23:19,25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],50:[1,30],51:[1,31],53:20,54:21,55:[1,22],56:[1,23],57:[1,35],61:[1,34],62:[1,29],65:[1,39],67:[1,28]},{49:[1,102],52:[1,101]},{50:[1,103]},{12:[2,91],49:[2,91],52:[2,91]},{12:[2,93],49:[2,93],52:[2,93],67:[1,44],71:[1,42],72:[1,43],73:[1,45]},{17:[2,53],18:[2,53],42:[1,104],43:[1,105],45:[2,53],49:[2,53],67:[1,44],71:[1,42],72:[1,43],73:[1,45]},{1:[2,46],12:[2,46],17:[2,46],18:[2,46],19:[2,46],24:[2,46],41:[2,46],42:[2,46],43:[2,46],45:[2,46],49:[2,46],52:[2,46],66:[2,46],67:[2,46],71:[2,46],72:[2,46],73:[2,46]},{17:[2,54],18:[2,54],45:[2,54],47:106,49:[1,107]},{17:[2,48],18:[2,48],19:[2,48],45:[2,48],49:[2,48]},{6:57,7:[1,10],13:[1,24],14:[1,25],15:109,18:[1,72],25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],46:108,48:71,50:[1,30],51:[1,31],62:[1,29],65:[1,39],67:[1,28]},{8:110,18:[1,63],21:[1,111]},{1:[2,72],17:[2,72],19:[2,72],24:[2,72],67:[1,44],71:[1,42],72:[1,43],73:[1,45]},{18:[1,112],67:[1,44],71:[1,42],72:[1,43],73:[1,45]},{66:[1,113],67:[1,44],71:[1,42],72:[1,43],73:[1,45]},{6:57,7:[1,10],13:[1,24],14:[1,25],15:114,25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],50:[1,30],51:[1,31],62:[1,29],65:[1,39],67:[1,28]},{8:115,18:[1,63],67:[1,44],71:[1,42],72:[1,43],73:[1,45]},{1:[2,16],17:[2,16],19:[2,16]},{1:[2,84],12:[2,84],17:[2,84],18:[2,84],19:[2,84],24:[2,84],41:[2,84],42:[2,84],43:[2,84],45:[2,84],49:[2,84],52:[2,84],66:[2,84],67:[2,84],71:[2,84],72:[2,84],73:[2,84]},{1:[2,85],12:[2,85],17:[2,85],18:[2,85],19:[2,85],24:[2,85],41:[2,85],42:[2,85],43:[2,85],45:[2,85],49:[2,85],52:[2,85],66:[2,85],67:[2,85],71:[1,42],72:[2,85],73:[2,85]},{1:[2,86],12:[2,86],17:[2,86],18:[2,86],19:[2,86],24:[2,86],41:[2,86],42:[2,86],43:[2,86],45:[2,86],49:[2,86],52:[2,86],66:[2,86],67:[2,86],71:[1,42],72:[2,86],73:[2,86]},{1:[2,87],12:[2,87],17:[2,87],18:[2,87],19:[2,87],24:[2,87],41:[2,87],42:[2,87],43:[2,87],45:[2,87],49:[2,87],52:[2,87],66:[2,87],67:[1,44],71:[1,42],72:[1,43],73:[2,87]},{1:[2,25],17:[2,25],19:[2,25],24:[2,25],67:[1,44],71:[1,42],72:[1,43],73:[1,45]},{1:[2,24],17:[2,24],19:[2,24],24:[2,24],67:[1,44],71:[1,42],72:[1,43],73:[1,45]},{1:[2,4],17:[2,4],19:[2,4]},{1:[2,5],17:[2,5],19:[2,5]},{12:[1,116],49:[1,102]},{6:57,7:[1,10],13:[1,24],14:[1,25],15:117,25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],50:[1,30],51:[1,31],62:[1,29],65:[1,39],67:[1,28]},{1:[2,79],12:[2,79],17:[2,79],18:[2,79],19:[2,79],24:[2,79],41:[2,79],42:[2,79],43:[2,79],45:[2,79],49:[2,79],52:[2,79],66:[2,79],67:[2,79],71:[2,79],72:[2,79],73:[2,79]},{1:[2,11],7:[2,11],10:[2,11],12:[2,11],14:[2,11],17:[2,11],18:[2,11],19:[2,11],24:[2,11],40:[2,11],41:[2,11],42:[2,11],43:[2,11],45:[2,11],49:[2,11],52:[2,11],63:[2,11],64:[2,11],66:[2,11],67:[2,11],68:[2,11],69:[2,11],70:[2,11],71:[2,11],72:[2,11],73:[2,11],74:[2,11]},{41:[1,118],42:[1,119],43:[1,120],67:[1,44],71:[1,42],72:[1,43],73:[1,45]},{1:[2,88],12:[2,88],17:[2,88],18:[2,88],19:[2,88],24:[2,88],41:[2,88],42:[2,88],43:[2,88],45:[2,88],49:[2,88],52:[2,88],66:[2,88],67:[1,44],71:[1,42],72:[1,43],73:[1,45]},{6:57,7:[1,10],13:[1,24],14:[1,25],15:121,25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],50:[1,30],51:[1,31],62:[1,29],65:[1,39],67:[1,28]},{1:[2,83],12:[2,83],17:[2,83],18:[2,83],19:[2,83],24:[2,83],41:[2,83],42:[2,83],43:[2,83],45:[2,83],49:[2,83],52:[2,83],66:[2,83],67:[1,44],71:[1,42],72:[1,43],73:[1,45]},{6:57,7:[1,10],11:122,12:[1,90],13:[1,24],14:[1,25],15:67,25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],50:[1,30],51:[1,31],62:[1,29],65:[1,39],67:[1,28],74:[1,89],75:66},{6:57,7:[1,10],13:[1,24],14:[1,25],15:123,25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],50:[1,30],51:[1,31],62:[1,29],65:[1,39],67:[1,28]},{6:57,7:[1,10],13:[1,24],14:[1,25],15:124,25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],50:[1,30],51:[1,31],62:[1,29],65:[1,39],67:[1,28]},{1:[2,18],12:[2,18],17:[2,18],18:[2,18],19:[2,18],22:[2,18],24:[2,18],41:[2,18],42:[2,18],43:[2,18],45:[2,18],49:[2,18],52:[2,18],60:[2,18],66:[2,18],67:[2,18],71:[2,18],72:[2,18],73:[2,18]},{17:[1,41],19:[1,125]},{50:[1,126]},{6:57,7:[1,10],13:[1,24],14:[1,25],15:67,25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],50:[1,30],51:[1,31],62:[1,29],65:[1,39],67:[1,28],75:127},{8:128,18:[1,63]},{6:57,7:[1,10],13:[1,24],14:[1,25],15:129,25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],50:[1,30],51:[1,31],62:[1,29],65:[1,39],67:[1,28]},{6:57,7:[1,10],13:[1,24],14:[1,25],15:130,25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],50:[1,30],51:[1,31],62:[1,29],65:[1,39],67:[1,28]},{17:[1,132],18:[1,133],45:[1,131]},{6:57,7:[1,10],13:[1,24],14:[1,25],15:109,17:[2,55],18:[2,55],19:[2,55],25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],45:[2,55],48:134,50:[1,30],51:[1,31],62:[1,29],65:[1,39],67:[1,28]},{17:[2,54],18:[2,54],19:[2,54],47:135,49:[1,107]},{17:[2,53],18:[2,53],19:[2,53],45:[2,53],49:[2,53],67:[1,44],71:[1,42],72:[1,43],73:[1,45]},{1:[2,23],17:[2,23],19:[2,23],24:[2,23]},{6:57,7:[1,10],13:[1,24],14:[1,25],15:136,25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],50:[1,30],51:[1,31],62:[1,29],65:[1,39],67:[1,28]},{58:137,59:138,60:[1,139]},{1:[2,76],12:[2,76],17:[2,76],18:[2,76],19:[2,76],24:[2,76],41:[2,76],42:[2,76],43:[2,76],45:[2,76],49:[2,76],52:[2,76],66:[2,76],67:[2,76],71:[2,76],72:[2,76],73:[2,76]},{19:[1,140],67:[1,44],71:[1,42],72:[1,43],73:[1,45]},{1:[2,20],17:[2,20],19:[2,20],22:[2,20],24:[2,20]},{1:[2,78],7:[1,141],17:[2,78],19:[2,78],24:[2,78],67:[2,78],71:[2,78],72:[2,78],73:[2,78]},{12:[1,142],67:[1,44],71:[1,42],72:[1,43],73:[1,45]},{1:[2,43],12:[2,43],17:[2,43],18:[2,43],19:[2,43],24:[2,43],41:[2,43],42:[2,43],43:[2,43],45:[2,43],49:[2,43],52:[2,43],66:[2,43],67:[2,43],71:[2,43],72:[2,43],73:[2,43]},{6:57,7:[1,10],13:[1,24],14:[1,25],15:143,25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],50:[1,30],51:[1,31],62:[1,29],65:[1,39],67:[1,28]},{6:57,7:[1,10],13:[1,24],14:[1,25],15:144,25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],50:[1,30],51:[1,31],62:[1,29],65:[1,39],67:[1,28]},{19:[1,145],67:[1,44],71:[1,42],72:[1,43],73:[1,45]},{12:[1,146],49:[1,102]},{8:147,18:[1,63],67:[1,44],71:[1,42],72:[1,43],73:[1,45]},{8:148,18:[1,63],67:[1,44],71:[1,42],72:[1,43],73:[1,45]},{1:[2,19],12:[2,19],17:[2,19],18:[2,19],19:[2,19],22:[2,19],24:[2,19],41:[2,19],42:[2,19],43:[2,19],45:[2,19],49:[2,19],52:[2,19],60:[2,19],66:[2,19],67:[2,19],71:[2,19],72:[2,19],73:[2,19]},{8:149,18:[1,63]},{12:[2,92],49:[2,92],52:[2,92]},{1:[2,60],12:[2,60],17:[2,60],18:[2,60],19:[2,60],24:[2,60],41:[2,60],42:[2,60],43:[2,60],45:[2,60],49:[2,60],52:[2,60],66:[2,60],67:[2,60],71:[2,60],72:[2,60],73:[2,60]},{45:[1,150],67:[1,44],71:[1,42],72:[1,43],73:[1,45]},{45:[1,151],67:[1,44],71:[1,42],72:[1,43],73:[1,45]},{1:[2,47],12:[2,47],17:[2,47],18:[2,47],19:[2,47],24:[2,47],41:[2,47],42:[2,47],43:[2,47],45:[2,47],49:[2,47],52:[2,47],66:[2,47],67:[2,47],71:[2,47],72:[2,47],73:[2,47]},{6:57,7:[1,10],13:[1,24],14:[1,25],15:109,25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],48:152,50:[1,30],51:[1,31],62:[1,29],65:[1,39],67:[1,28]},{6:57,7:[1,10],13:[1,24],14:[1,25],15:109,18:[1,72],25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],46:153,48:71,50:[1,30],51:[1,31],62:[1,29],65:[1,39],67:[1,28]},{17:[2,49],18:[2,49],19:[2,49],45:[2,49],49:[2,49]},{17:[1,132],18:[1,133],19:[1,154]},{8:155,18:[1,63],67:[1,44],71:[1,42],72:[1,43],73:[1,45]},{19:[1,156],22:[1,157],59:158,60:[1,139]},{19:[2,68],22:[2,68],60:[2,68]},{6:57,7:[1,10],13:[1,24],14:[1,25],15:159,25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],50:[1,30],51:[1,31],62:[1,29],65:[1,39],67:[1,28]},{66:[1,160]},{1:[2,6],5:4,6:7,7:[1,10],8:161,9:162,13:[1,24],14:[1,25],15:5,16:6,17:[2,6],18:[1,63],19:[2,6],20:33,21:[1,40],23:19,25:26,26:[1,36],27:[1,37],28:[1,38],29:9,30:27,31:8,32:11,33:12,34:13,35:14,36:15,37:16,38:17,39:18,44:[1,32],50:[1,30],51:[1,31],53:20,54:21,55:[1,22],56:[1,23],57:[1,35],61:[1,34],62:[1,29],65:[1,39],67:[1,28]},{1:[2,90],12:[2,90],17:[2,90],18:[2,90],19:[2,90],24:[2,90],41:[2,90],42:[2,90],43:[2,90],45:[2,90],49:[2,90],52:[2,90],66:[2,90],67:[2,90],71:[2,90],72:[2,90],73:[2,90]},{41:[1,163],67:[1,44],71:[1,42],72:[1,43],73:[1,45]},{41:[1,164],67:[1,44],71:[1,42],72:[1,43],73:[1,45]},{1:[2,89],12:[2,89],17:[2,89],18:[2,89],19:[2,89],24:[2,89],41:[2,89],42:[2,89],43:[2,89],45:[2,89],49:[2,89],52:[2,89],66:[2,89],67:[2,89],71:[2,89],72:[2,89],73:[2,89]},{1:[2,78],12:[2,78],17:[2,78],18:[2,78],19:[2,78],24:[2,78],41:[2,78],42:[2,78],43:[2,78],45:[2,78],49:[2,78],52:[2,78],66:[2,78],67:[2,78],71:[2,78],72:[2,78],73:[2,78]},{1:[2,74],12:[2,74],17:[2,74],18:[2,74],19:[2,74],24:[2,74],41:[2,74],42:[2,74],43:[2,74],45:[2,74],49:[2,74],52:[2,74],66:[2,74],67:[2,74],71:[2,74],72:[2,74],73:[2,74]},{1:[2,75],12:[2,75],17:[2,75],18:[2,75],19:[2,75],24:[2,75],41:[2,75],42:[2,75],43:[2,75],45:[2,75],49:[2,75],52:[2,75],66:[2,75],67:[2,75],71:[2,75],72:[2,75],73:[2,75]},{1:[2,59],12:[2,59],17:[2,59],18:[2,59],19:[2,59],24:[2,59],41:[2,59],42:[2,59],43:[2,59],45:[2,59],49:[2,59],52:[2,59],66:[2,59],67:[2,59],71:[2,59],72:[2,59],73:[2,59]},{1:[2,56],12:[2,56],17:[2,56],18:[2,56],19:[2,56],24:[2,56],41:[2,56],42:[2,56],43:[2,56],45:[2,56],49:[2,56],52:[2,56],66:[2,56],67:[2,56],71:[2,56],72:[2,56],73:[2,56]},{1:[2,57],12:[2,57],17:[2,57],18:[2,57],19:[2,57],24:[2,57],41:[2,57],42:[2,57],43:[2,57],45:[2,57],49:[2,57],52:[2,57],66:[2,57],67:[2,57],71:[2,57],72:[2,57],73:[2,57]},{17:[2,50],18:[2,50],19:[2,50],45:[2,50],49:[2,50]},{17:[2,54],18:[2,54],19:[2,54],47:165,49:[1,107]},{17:[2,51],18:[2,51],19:[2,51],45:[2,51],49:[2,51]},{1:[2,21],17:[2,21],19:[2,21],22:[2,21],24:[2,21]},{1:[2,66],17:[2,66],19:[2,66],24:[2,66]},{8:166,18:[1,63]},{19:[2,69],22:[2,69],60:[2,69]},{8:167,18:[1,63],67:[1,44],71:[1,42],72:[1,43],73:[1,45]},{1:[2,77],12:[2,77],17:[2,77],18:[2,77],19:[2,77],24:[2,77],41:[2,77],42:[2,77],43:[2,77],45:[2,77],49:[2,77],52:[2,77],66:[2,77],67:[2,77],71:[2,77],72:[2,77],73:[2,77]},{1:[2,7],17:[2,7],19:[2,7]},{1:[2,8],17:[2,8],19:[2,8]},{1:[2,44],12:[2,44],17:[2,44],18:[2,44],19:[2,44],24:[2,44],41:[2,44],42:[2,44],43:[2,44],45:[2,44],49:[2,44],52:[2,44],66:[2,44],67:[2,44],71:[2,44],72:[2,44],73:[2,44]},{1:[2,45],12:[2,45],17:[2,45],18:[2,45],19:[2,45],24:[2,45],41:[2,45],42:[2,45],43:[2,45],45:[2,45],49:[2,45],52:[2,45],66:[2,45],67:[2,45],71:[2,45],72:[2,45],73:[2,45]},{17:[1,132],18:[1,133],19:[1,168]},{19:[1,169]},{17:[1,170],19:[2,70],22:[2,70],60:[2,70]},{17:[2,52],18:[2,52],19:[2,52],45:[2,52],49:[2,52]},{1:[2,67],17:[2,67],19:[2,67],24:[2,67]},{19:[2,71],22:[2,71],60:[2,71]}],
defaultActions: {},
parseError: function parseError(str, hash) {
    throw new Error(str);
},
parse: function parse(input) {
    var self = this,
        stack = [0],
        vstack = [null], // semantic value stack
        lstack = [], // location stack
        table = this.table,
        yytext = '',
        yylineno = 0,
        yyleng = 0,
        recovering = 0,
        TERROR = 2,
        EOF = 1;

    //this.reductionCount = this.shiftCount = 0;

    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    if (typeof this.lexer.yylloc == 'undefined')
        this.lexer.yylloc = {};
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);

    if (typeof this.yy.parseError === 'function')
        this.parseError = this.yy.parseError;

    function popStack (n) {
        stack.length = stack.length - 2*n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }

    function lex() {
        var token;
        token = self.lexer.lex() || 1; // $end = 1
        // if token isn't its numeric value, convert
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    };

    var symbol, preErrorSymbol, state, action, a, r, yyval={},p,len,newState, expected;
    while (true) {
        // retreive state number from top of stack
        state = stack[stack.length-1];

        // use default actions if available
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol == null)
                symbol = lex();
            // read action for current state and first input
            action = table[state] && table[state][symbol];
        }

        // handle parse error
        if (typeof action === 'undefined' || !action.length || !action[0]) {

            if (!recovering) {
                // Report error
                expected = [];
                for (p in table[state]) if (this.terminals_[p] && p > 2) {
                    expected.push("'"+this.terminals_[p]+"'");
                }
                var errStr = '';
                if (this.lexer.showPosition) {
                    errStr = 'Parse error on line '+(yylineno+1)+":\n"+this.lexer.showPosition()+'\nExpecting '+expected.join(', ');
                } else {
                    errStr = 'Parse error on line '+(yylineno+1)+": Unexpected " +
                                  (symbol == 1 /*EOF*/ ? "end of input" :
                                              ("'"+(this.terminals_[symbol] || symbol)+"'"));
                }
                this.parseError(errStr,
                    {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected});
            }

            // just recovered from another error
            if (recovering == 3) {
                if (symbol == EOF) {
                    throw new Error(errStr || 'Parsing halted.');
                }

                // discard current lookahead and grab another
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                symbol = lex();
            }

            // try to recover from error
            while (1) {
                // check for error recovery rule in this state
                if ((TERROR.toString()) in table[state]) {
                    break;
                }
                if (state == 0) {
                    throw new Error(errStr || 'Parsing halted.');
                }
                popStack(1);
                state = stack[stack.length-1];
            }

            preErrorSymbol = symbol; // save the lookahead token
            symbol = TERROR;         // insert generic error symbol as new lookahead
            state = stack[stack.length-1];
            action = table[state] && table[state][TERROR];
            recovering = 3; // allow 3 real symbols to be shifted before reporting a new error
        }

        // this shouldn't happen, unless resolve defaults are off
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: '+state+', token: '+symbol);
        }

        switch (action[0]) {

            case 1: // shift
                //this.shiftCount++;

                stack.push(symbol);
                vstack.push(this.lexer.yytext);
                lstack.push(this.lexer.yylloc);
                stack.push(action[1]); // push state
                symbol = null;
                if (!preErrorSymbol) { // normal execution/no error
                    yyleng = this.lexer.yyleng;
                    yytext = this.lexer.yytext;
                    yylineno = this.lexer.yylineno;
                    yyloc = this.lexer.yylloc;
                    if (recovering > 0)
                        recovering--;
                } else { // error just occurred, resume old lookahead f/ before error
                    symbol = preErrorSymbol;
                    preErrorSymbol = null;
                }
                break;

            case 2: // reduce
                //this.reductionCount++;

                len = this.productions_[action[1]][1];

                // perform semantic action
                yyval.$ = vstack[vstack.length-len]; // default to $$ = $1
                // default location, uses first token for firsts, last for lasts
                yyval._$ = {
                    first_line: lstack[lstack.length-(len||1)].first_line,
                    last_line: lstack[lstack.length-1].last_line,
                    first_column: lstack[lstack.length-(len||1)].first_column,
                    last_column: lstack[lstack.length-1].last_column
                };
                r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);

                if (typeof r !== 'undefined') {
                    return r;
                }

                // pop off stack
                if (len) {
                    stack = stack.slice(0,-1*len*2);
                    vstack = vstack.slice(0, -1*len);
                    lstack = lstack.slice(0, -1*len);
                }

                stack.push(this.productions_[action[1]][0]);    // push nonterminal (reduce)
                vstack.push(yyval.$);
                lstack.push(yyval._$);
                // goto new state = table[STATE][NONTERMINAL]
                newState = table[stack[stack.length-2]][stack[stack.length-1]];
                stack.push(newState);
                break;

            case 3: // accept
                return true;
        }

    }

    return true;
}};
return parser;
})();
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); }
exports.main = function commonjsMain(args) {
    if (!args[1])
        throw new Error('Usage: '+args[0]+' FILE');
    if (typeof process !== 'undefined') {
        var source = require('fs').readFileSync(require('path').join(process.cwd(), args[1]), "utf8");
    } else {
        var cwd = require("file").path(require("file").cwd());
        var source = cwd.join(args[1]).read({charset: "utf-8"});
    }
    return exports.parser.parse(source);
}
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(typeof process !== 'undefined' ? process.argv.slice(1) : require("system").args);
}
}
;

      return exports;
    });
    
    _require['preprocessor_variables'] = (function() {
      var exports = this;
      _require['preprocessor_variables'] = function() { return exports; };
      var __dirname = './.';
      (function() {
  var PreprocessorVariables, path;

  path = require('path');

  PreprocessorVariables = (function() {

    function PreprocessorVariables() {
      this.defaults();
    }

    PreprocessorVariables.prototype.reset = function() {
      var k, v;
      for (k in this) {
        v = this[k];
        if (!(v instanceof Function)) delete this[k];
      }
      return this.defaults();
    };

    PreprocessorVariables.prototype.defaults = function() {
      var _this = this;
      this.ambrosia_path = __dirname;
      this.ambrosia_stdlib_path = process.env['AMBROSIA_STDLIB_PATH'] || path.join(__dirname, '../tml');
      this.ambrosia_file_ext = process.env['AMBROSIA_FILE_EXT'] || ".tml.ambrosia";
      return this.view_paths || (this.view_paths = (function() {
        var p, paths;
        paths = [path.join(process.cwd(), 'views'), path.join(_this.ambrosia_stdlib_path, "std/views")];
        if (p = process.env['AMBROSIA_VIEW_PATH']) paths.unshift(p);
        return paths;
      })());
    };

    return PreprocessorVariables;

  })();

  exports.$ = new PreprocessorVariables;

}).call(this);

      return exports;
    });
    
    _require['rewriter'] = (function() {
      var exports = this;
      _require['rewriter'] = function() { return exports; };
      var __dirname = './.';
      (function() {
  var BALANCED_PAIRS, EXPRESSION_CLOSE, EXPRESSION_END, EXPRESSION_START, IMPLICIT_BLOCK, IMPLICIT_CALL, IMPLICIT_END, IMPLICIT_FUNC, IMPLICIT_UNSPACED_CALL, INVERSES, LINEBREAKS, SINGLE_CLOSERS, SINGLE_LINERS, left, rite, _i, _len, _ref,
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = Array.prototype.slice;

  exports.Rewriter = (function() {

    function Rewriter() {}

    Rewriter.prototype.rewrite = function(tokens) {
      this.tokens = tokens;
      this.removeLeadingNewlines();
      this.removeMidExpressionNewlines();
      this.closeOpenCalls();
      this.closeOpenIndexes();
      this.addImplicitIndentation();
      this.tagPostfixConditionals();
      this.addImplicitParentheses();
      return this.tokens;
    };

    Rewriter.prototype.scanTokens = function(block) {
      var i, token, tokens;
      tokens = this.tokens;
      i = 0;
      while (token = tokens[i]) {
        i += block.call(this, token, i, tokens);
      }
      return true;
    };

    Rewriter.prototype.detectEnd = function(i, condition, action) {
      var levels, token, tokens, _ref, _ref2;
      tokens = this.tokens;
      levels = 0;
      while (token = tokens[i]) {
        if (levels === 0 && condition.call(this, token, i)) {
          return action.call(this, token, i);
        }
        if (!token || levels < 0) return action.call(this, token, i - 1);
        if (_ref = token[0], __indexOf.call(EXPRESSION_START, _ref) >= 0) {
          levels += 1;
        } else if (_ref2 = token[0], __indexOf.call(EXPRESSION_END, _ref2) >= 0) {
          levels -= 1;
        }
        i += 1;
      }
      return i - 1;
    };

    Rewriter.prototype.removeLeadingNewlines = function() {
      var i, tag, _len, _ref;
      _ref = this.tokens;
      for (i = 0, _len = _ref.length; i < _len; i++) {
        tag = _ref[i][0];
        if (tag !== 'TERMINATOR') break;
      }
      if (i) return this.tokens.splice(0, i);
    };

    Rewriter.prototype.removeMidExpressionNewlines = function() {
      return this.scanTokens(function(token, i, tokens) {
        var _ref;
        if (!(token[0] === 'TERMINATOR' && (_ref = this.tag(i + 1), __indexOf.call(EXPRESSION_CLOSE, _ref) >= 0))) {
          return 1;
        }
        tokens.splice(i, 1);
        return 0;
      });
    };

    Rewriter.prototype.closeOpenCalls = function() {
      var action, condition;
      condition = function(token, i) {
        var _ref;
        return ((_ref = token[0]) === ')' || _ref === 'CALL_END') || token[0] === 'OUTDENT' && this.tag(i - 1) === ')';
      };
      action = function(token, i) {
        return this.tokens[token[0] === 'OUTDENT' ? i - 1 : i][0] = 'CALL_END';
      };
      return this.scanTokens(function(token, i) {
        if (token[0] === 'CALL_START') this.detectEnd(i + 1, condition, action);
        return 1;
      });
    };

    Rewriter.prototype.closeOpenIndexes = function() {
      var action, condition;
      condition = function(token, i) {
        var _ref;
        return (_ref = token[0]) === ']' || _ref === 'INDEX_END';
      };
      action = function(token, i) {
        return token[0] = 'INDEX_END';
      };
      return this.scanTokens(function(token, i) {
        if (token[0] === 'INDEX_START') this.detectEnd(i + 1, condition, action);
        return 1;
      });
    };

    Rewriter.prototype.addImplicitBraces = function() {
      var action, condition, stack, start, startIndent;
      stack = [];
      start = null;
      startIndent = 0;
      condition = function(token, i) {
        var one, tag, three, two, _ref, _ref2;
        _ref = this.tokens.slice(i + 1, (i + 3) + 1 || 9e9), one = _ref[0], two = _ref[1], three = _ref[2];
        if ('HERECOMMENT' === (one != null ? one[0] : void 0)) return false;
        tag = token[0];
        return ((tag === 'TERMINATOR' || tag === 'OUTDENT') && !((two != null ? two[0] : void 0) === ':' || (one != null ? one[0] : void 0) === '@' && (three != null ? three[0] : void 0) === ':')) || (tag === ',' && one && ((_ref2 = one[0]) !== 'IDENTIFIER' && _ref2 !== 'NUMBER' && _ref2 !== 'STRING' && _ref2 !== '@' && _ref2 !== 'TERMINATOR' && _ref2 !== 'OUTDENT'));
      };
      action = function(token, i) {
        var tok;
        tok = ['}', '}', token[2]];
        tok.generated = true;
        return this.tokens.splice(i, 0, tok);
      };
      return this.scanTokens(function(token, i, tokens) {
        var ago, idx, tag, tok, value, _ref, _ref2;
        if (_ref = (tag = token[0]), __indexOf.call(EXPRESSION_START, _ref) >= 0) {
          stack.push([(tag === 'INDENT' && this.tag(i - 1) === '{' ? '{' : tag), i]);
          return 1;
        }
        if (__indexOf.call(EXPRESSION_END, tag) >= 0) {
          start = stack.pop();
          return 1;
        }
        if (!(tag === ':' && ((ago = this.tag(i - 2)) === ':' || ((_ref2 = stack[stack.length - 1]) != null ? _ref2[0] : void 0) !== '{'))) {
          return 1;
        }
        stack.push(['{']);
        idx = ago === '@' ? i - 2 : i - 1;
        while (this.tag(idx - 2) === 'HERECOMMENT') {
          idx -= 2;
        }
        value = new String('{');
        value.generated = true;
        tok = ['{', value, token[2]];
        tok.generated = true;
        tokens.splice(idx, 0, tok);
        this.detectEnd(i + 2, condition, action);
        return 2;
      });
    };

    Rewriter.prototype.addImplicitParentheses = function() {
      var action, noCall;
      noCall = false;
      action = function(token, i) {
        return this.tokens.splice(i, 0, ['CALL_END', ')', token[2]]);
      };
      return this.scanTokens(function(token, i, tokens) {
        var callObject, current, next, prev, seenControl, seenSingle, tag, _ref, _ref2, _ref3;
        tag = token[0];
        if (tag === 'CLASS' || tag === 'IF') noCall = true;
        _ref = tokens.slice(i - 1, (i + 1) + 1 || 9e9), prev = _ref[0], current = _ref[1], next = _ref[2];
        callObject = !noCall && tag === 'INDENT' && next && next.generated && next[0] === '{' && prev && (_ref2 = prev[0], __indexOf.call(IMPLICIT_FUNC, _ref2) >= 0);
        seenSingle = false;
        seenControl = false;
        if (__indexOf.call(LINEBREAKS, tag) >= 0) noCall = false;
        if (prev && !prev.spaced && tag === '?') token.call = true;
        if (token.fromThen) return 1;
        if (!(callObject || (prev != null ? prev.spaced : void 0) && (prev.call || (_ref3 = prev[0], __indexOf.call(IMPLICIT_FUNC, _ref3) >= 0)) && (__indexOf.call(IMPLICIT_CALL, tag) >= 0 || !(token.spaced || token.newLine) && __indexOf.call(IMPLICIT_UNSPACED_CALL, tag) >= 0))) {
          return 1;
        }
        tokens.splice(i, 0, ['CALL_START', '(', token[2]]);
        this.detectEnd(i + 1, function(token, i) {
          var post, _ref4;
          tag = token[0];
          if (!seenSingle && token.fromThen) return true;
          if (tag === 'IF' || tag === 'ELSE' || tag === 'CATCH' || tag === '->' || tag === '=>') {
            seenSingle = true;
          }
          if (tag === 'IF' || tag === 'ELSE' || tag === 'SWITCH' || tag === 'TRY') {
            seenControl = true;
          }
          if ((tag === '.' || tag === '?.' || tag === '::') && this.tag(i - 1) === 'OUTDENT') {
            return true;
          }
          return !token.generated && this.tag(i - 1) !== ',' && (__indexOf.call(IMPLICIT_END, tag) >= 0 || (tag === 'INDENT' && !seenControl)) && (tag !== 'INDENT' || (this.tag(i - 2) !== 'CLASS' && (_ref4 = this.tag(i - 1), __indexOf.call(IMPLICIT_BLOCK, _ref4) < 0) && !((post = this.tokens[i + 1]) && post.generated && post[0] === '{')));
        }, action);
        if (prev[0] === '?') prev[0] = 'FUNC_EXIST';
        return 2;
      });
    };

    Rewriter.prototype.addImplicitIndentation = function() {
      return this.scanTokens(function(token, i, tokens) {
        var action, condition, indent, outdent, starter, tag, _ref, _ref2;
        tag = token[0];
        if (tag === 'TERMINATOR' && this.tag(i + 1) === 'THEN') {
          tokens.splice(i, 1);
          return 0;
        }
        if (tag === 'ELSE' && this.tag(i - 1) !== 'OUTDENT') {
          tokens.splice.apply(tokens, [i, 0].concat(__slice.call(this.indentation(token))));
          return 2;
        }
        if (tag === 'CATCH' && ((_ref = this.tag(i + 2)) === 'OUTDENT' || _ref === 'TERMINATOR' || _ref === 'FINALLY')) {
          tokens.splice.apply(tokens, [i + 2, 0].concat(__slice.call(this.indentation(token))));
          return 4;
        }
        if (__indexOf.call(SINGLE_LINERS, tag) >= 0 && this.tag(i + 1) !== 'INDENT' && !(tag === 'ELSE' && this.tag(i + 1) === 'IF')) {
          starter = tag;
          _ref2 = this.indentation(token), indent = _ref2[0], outdent = _ref2[1];
          if (starter === 'THEN') indent.fromThen = true;
          indent.generated = outdent.generated = true;
          tokens.splice(i + 1, 0, indent);
          condition = function(token, i) {
            var _ref3;
            return token[1] !== ';' && (_ref3 = token[0], __indexOf.call(SINGLE_CLOSERS, _ref3) >= 0) && !(token[0] === 'ELSE' && (starter !== 'IF' && starter !== 'THEN'));
          };
          action = function(token, i) {
            return this.tokens.splice((this.tag(i - 1) === ',' ? i - 1 : i), 0, outdent);
          };
          this.detectEnd(i + 2, condition, action);
          if (tag === 'THEN') tokens.splice(i, 1);
          return 1;
        }
        return 1;
      });
    };

    Rewriter.prototype.tagPostfixConditionals = function() {
      var condition;
      condition = function(token, i) {
        var _ref;
        return (_ref = token[0]) === 'TERMINATOR' || _ref === 'INDENT';
      };
      return this.scanTokens(function(token, i) {
        var original;
        if (token[0] !== 'IF') return 1;
        original = token;
        this.detectEnd(i + 1, condition, function(token, i) {
          if (token[0] !== 'INDENT') return original[0] = 'POST_' + original[0];
        });
        return 1;
      });
    };

    Rewriter.prototype.indentation = function(token) {
      return [['INDENT', 2, token[2]], ['OUTDENT', 2, token[2]]];
    };

    Rewriter.prototype.tag = function(i) {
      var _ref;
      return (_ref = this.tokens[i]) != null ? _ref[0] : void 0;
    };

    return Rewriter;

  })();

  BALANCED_PAIRS = [['(', ')'], ['[', ']'], ['{', '}'], ['INDENT', 'OUTDENT'], ['CALL_START', 'CALL_END'], ['PARAM_START', 'PARAM_END'], ['INDEX_START', 'INDEX_END']];

  exports.INVERSES = INVERSES = {};

  EXPRESSION_START = [];

  EXPRESSION_END = [];

  for (_i = 0, _len = BALANCED_PAIRS.length; _i < _len; _i++) {
    _ref = BALANCED_PAIRS[_i], left = _ref[0], rite = _ref[1];
    EXPRESSION_START.push(INVERSES[rite] = left);
    EXPRESSION_END.push(INVERSES[left] = rite);
  }

  EXPRESSION_CLOSE = ['CATCH', 'WHEN', 'ELSE', 'FINALLY'].concat(EXPRESSION_END);

  IMPLICIT_FUNC = ['IDENTIFIER', 'SUPER', ')', 'CALL_END', ']', 'INDEX_END', '@', 'THIS'];

  IMPLICIT_CALL = ['IDENTIFIER', 'NUMBER', 'STRING', 'JS', 'REGEX', 'NEW', 'PARAM_START', 'CLASS', 'IF', 'TRY', 'SWITCH', 'THIS', 'BOOL', 'UNARY', 'SUPER', '@', '->', '=>', '[', '(', '{', '--', '++'];

  IMPLICIT_UNSPACED_CALL = ['+', '-'];

  IMPLICIT_BLOCK = ['->', '=>', '{', '[', ','];

  IMPLICIT_END = ['POST_IF', 'FOR', 'WHILE', 'UNTIL', 'WHEN', 'BY', 'LOOP', 'TERMINATOR'];

  SINGLE_LINERS = ['ELSE', '->', '=>', 'TRY', 'FINALLY', 'THEN'];

  SINGLE_CLOSERS = ['TERMINATOR', 'CATCH', 'FINALLY', 'ELSE', 'OUTDENT', 'LEADING_WHEN'];

  LINEBREAKS = ['TERMINATOR', 'INDENT', 'OUTDENT'];

}).call(this);

      return exports;
    });
    
    _require['simulator'] = (function() {
      var exports = this;
      _require['simulator'] = function() { return exports; };
      var __dirname = './.';
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
          if (card.attrs['parser'] === 'mag' && card.attrs['params'] === 'read_data') {
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

      return exports;
    });
    
    _require['simulator/all_expressions'] = (function() {
      var exports = this;
      _require['simulator/all_expressions'] = function() { return exports; };
      var __dirname = './simulator';
      (function() {

  require('simulator/number_expression');

  require('simulator/string_expression');

  require('simulator/boolean_expression');

}).call(this);

      return exports;
    });
    
    _require['simulator/boolean_expression'] = (function() {
      var exports = this;
      _require['simulator/boolean_expression'] = function() { return exports; };
      var __dirname = './simulator';
      (function() {
  var BooleanExpression, Expression, Format,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Expression = require('simulator/expression').Expression;

  Format = require('simulator/formatters').Format;

  Expression.register_type('boolean', BooleanExpression = (function(_super) {

    __extends(BooleanExpression, _super);

    function BooleanExpression() {
      BooleanExpression.__super__.constructor.apply(this, arguments);
    }

    BooleanExpression.prototype.evaluate = function() {
      if (this.format) {
        this.lvalue = new Format('string', this.format.toString(), this.lvalue.toString()).process();
      }
      switch (this.op) {
        case 'equal':
          return this.lvalue.toString() === this.rvalue.toString();
        case 'not_equal':
          this.op = 'equal';
          return !this.evaluate();
        case 'less':
          this.rvalue = parseInt(this.rvalue) - 1;
          this.op = 'less_or_equal';
          return this.evaluate();
        case 'less_or_equal':
          return parseInt(this.lvalue) <= parseInt(this.rvalue);
        case 'contains':
          return this.lvalue.toString().indexOf(this.rvalue.toString()) !== -1;
        default:
          throw new Error("Invalid boolean operation: " + this.op);
      }
    };

    return BooleanExpression;

  })(Expression));

}).call(this);

      return exports;
    });
    
    _require['simulator/common'] = (function() {
      var exports = this;
      _require['simulator/common'] = function() { return exports; };
      var __dirname = './simulator';
      (function() {
  var CastValue, DefaultVariableValue, Literalize, VariableValue;

  exports.DefaultVariableValue = DefaultVariableValue = function(variable) {
    return CastValue(variable.attrs.value, variable.attrs.type);
  };

  exports.CastValue = CastValue = function(value, type) {
    var result;
    value = (value === void 0 ? "" : value).toString();
    switch (type) {
      case 'integer':
        result = parseInt(value);
        if (isNaN(result) || !isFinite(result)) result = 0;
        return result;
      case 'datetime':
        return new Date(value);
      case 'opaque':
      case 'string':
        return value;
      default:
        return value;
    }
  };

  exports.VariableValue = VariableValue = function(variable_state, varname) {
    var variable;
    variable = variable_state[varname];
    if (variable === void 0) throw new Error("Undefined variable: " + varname);
    return variable;
  };

  exports.Literalize = Literalize = function(variable_state, value, type) {
    var match, v;
    while (match = /tmlvar:([^;]+)/.exec(value.toString())) {
      v = VariableValue(variable_state, match[1]).value;
      value = value.replace(match[0], v);
    }
    return CastValue(value, type);
  };

}).call(this);

      return exports;
    });
    
    _require['simulator/expression'] = (function() {
      var exports = this;
      _require['simulator/expression'] = function() { return exports; };
      var __dirname = './simulator';
      (function() {
  var Expression, Literalize;

  Literalize = require('simulator/common').Literalize;

  exports.Expression = Expression = (function() {

    function Expression(variable_state, expr) {
      this.variable_state = variable_state;
      this.format = expr.format;
      this.op = expr.op;
      if (expr.lo === void 0) {
        throw new Error("No lvalue in expression " + (JSON.stringify(expr)));
      }
      this.lvalue = Literalize(this.variable_state, expr.lo, this.type);
      if (expr.ro !== void 0 && expr.ro !== '') {
        this.rvalue = Literalize(this.variable_state, expr.ro, this.type);
      } else {
        this.rvalue = expr.ro;
      }
    }

    Expression.prototype.evaluate = function() {
      throw new Error("Override Expression#evaluate returning result");
    };

    Expression.evaluate = function(type, expr, variable_state) {
      if (variable_state == null) variable_state = {};
      if (Expression.types[type]) {
        return new Expression.types[type](variable_state, expr).evaluate();
      } else {
        throw new Error("No expression candidate for type " + type);
      }
    };

    Expression.register_type = function(type, klass) {
      Expression.types[type] = klass;
      return klass.prototype.type = type;
    };

    Expression.prototype.type = null;

    Expression.types = {};

    return Expression;

  })();

}).call(this);

      return exports;
    });
    
    _require['simulator/formatters'] = (function() {
      var exports = this;
      _require['simulator/formatters'] = function() { return exports; };
      var __dirname = './simulator';
      (function() {
  var Format,
    __slice = Array.prototype.slice;

  exports.Format = Format = (function() {

    function Format(type, format, string) {
      var format_pattern, formatter, match, _formatters, _i, _len, _match;
      this.string = string;
      this.formatters = [];
      _formatters = Format._formatters[type];
      if (!_formatters) {
        throw new Error("Couldn't find any formatters for type " + type + "!");
      }
      while (format.length > 0) {
        match = null;
        for (_i = 0, _len = _formatters.length; _i < _len; _i++) {
          formatter = _formatters[_i];
          formatter = __slice.call(formatter);
          format_pattern = formatter[0];
          if (format_pattern instanceof RegExp) {
            match = format_pattern.exec(format);
            if (match) {
              _match = match.shift();
              formatter.push(match);
              this.formatters.push(formatter);
              match = _match;
              break;
            }
          } else {
            if (format.indexOf(format_pattern) === 0) {
              match = format_pattern;
              formatter.push(match);
              this.formatters.push(formatter);
              break;
            }
          }
        }
        if (!match) this.formatters.push(match = format.substring(0, 1));
        format = format.replace(match, '');
      }
    }

    Format.prototype.process = function() {
      var callback, escaped, format, formatter, i, result, t, _i, _j, _len, _len2, _ref, _result;
      result = "";
      _ref = this.formatters;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        formatter = _ref[_i];
        if (typeof formatter === 'string') {
          result += formatter;
        } else {
          format = formatter[0];
          callback = formatter[1];
          t = callback.apply(null, [this.string].concat(__slice.call(formatter[2])));
          if (t && t[0]) {
            result += t[0];
            this.string = t[1];
          }
        }
      }
      escaped = false;
      _result = "";
      for (_j = 0, _len2 = result.length; _j < _len2; _j++) {
        i = result[_j];
        if (escaped === true) {
          _result += i;
          continue;
        }
        if (i === "\\") {
          escaped = true;
          continue;
        }
        _result += i;
      }
      return _result;
    };

    Format._formatters = {};

    Format.register = function(type, format, callback) {
      var index, _base, _ref;
      if (callback == null) callback = null;
      (_base = this._formatters)[type] || (_base[type] = []);
      for (index = 0, _ref = this._formatters[type].length; 0 <= _ref ? index < _ref : index > _ref; 0 <= _ref ? index++ : index--) {
        if (this._formatters[type][index][0].toString().length < format.toString().length) {
          return this._formatters[type].splice(index, 0, [format, callback]);
        }
      }
      return this._formatters[type].push([format, callback]);
    };

    return Format;

  })();

  Format.register('string', 'c', function(string) {
    var res;
    res = /^\D/.exec(string);
    return res && [res[0], string.replace(res[0], '')];
  });

  Format.register('string', 'c*', function(string) {
    var res;
    res = /^\D*/.exec(string);
    return res && [res[0], string.replace(res[0], '')];
  });

  Format.register('string', 'c#', function(string) {
    var res;
    res = /^\D/.exec(string);
    return res && ["*", string.substring(1, string.length)];
  });

  Format.register('string', 'c#*', function(string) {
    var i, res;
    res = /^\D*/.exec(string);
    return res && [
      ((function() {
        var _ref, _results;
        _results = [];
        for (i = 0, _ref = res[0].length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
          _results.push("*");
        }
        return _results;
      })()).join(""), string.substring(res[0].length, string.length)
    ];
  });

  Format.register('string', 'n', function(string) {
    var res;
    res = /^\d/.exec(string);
    return res && [res[0], string.replace(res[0], '')];
  });

  Format.register('string', 'n*', function(string) {
    var res;
    res = /^\d*/.exec(string);
    return res && [res[0], string.replace(res[0], '')];
  });

  Format.register('string', 'n#', function(string) {
    var res;
    res = /^\d/.exec(string);
    return res && ["*", string.substring(1, string.length)];
  });

  Format.register('string', 'n#*', function(string) {
    var i, res;
    res = /^\d*/.exec(string);
    return res && [
      ((function() {
        var _ref, _results;
        _results = [];
        for (i = 0, _ref = res[0].length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
          _results.push("*");
        }
        return _results;
      })()).join(""), string.substring(res[0].length, string.length)
    ];
  });

  Format.register('string', /^([cn])(\d+)/, function(string, c_or_n, digits) {
    var i, res;
    if (c_or_n === 'c') {
      res = new RegExp("^\\D{0," + digits + "}");
    } else {
      res = new RegExp("^\\d{0," + digits + "}");
    }
    if (res = res.exec(string)) {
      res = res[0];
      return [
        res + ((function() {
          var _ref, _results;
          _results = [];
          for (i = _ref = res.length; _ref <= digits ? i < digits : i > digits; _ref <= digits ? i++ : i--) {
            _results.push("-");
          }
          return _results;
        })()).join(""), string.substring(res.length, string.length)
      ];
    } else {
      return [
        ((function() {
          var _results;
          _results = [];
          for (i = 0; 0 <= digits ? i < digits : i > digits; 0 <= digits ? i++ : i--) {
            _results.push("-");
          }
          return _results;
        })()).join(""), string
      ];
    }
  });

  Format.register('string', /^([cn])#(\d+)/, function(string, c_or_n, digits) {
    var c, i, res;
    if (c_or_n === 'c') {
      res = new RegExp("^\\D{0," + digits + "}");
    } else {
      res = new RegExp("^\\d{0," + digits + "}");
    }
    if (res = res.exec(string)) {
      res = res[0];
      return [
        ((function() {
          var _ref, _results;
          _results = [];
          for (c = 0, _ref = res.length; 0 <= _ref ? c < _ref : c > _ref; 0 <= _ref ? c++ : c--) {
            _results.push("*");
          }
          return _results;
        })()).join("") + ((function() {
          var _ref, _results;
          _results = [];
          for (i = _ref = res.length; _ref <= digits ? i < digits : i > digits; _ref <= digits ? i++ : i--) {
            _results.push("*");
          }
          return _results;
        })()).join(""), string.substring(res.length, string.length)
      ];
    } else {
      return [
        ((function() {
          var _results;
          _results = [];
          for (i = 0; 0 <= digits ? i < digits : i > digits; 0 <= digits ? i++ : i--) {
            _results.push("*");
          }
          return _results;
        })()).join(""), string
      ];
    }
  });

}).call(this);

      return exports;
    });
    
    _require['simulator/number_expression'] = (function() {
      var exports = this;
      _require['simulator/number_expression'] = function() { return exports; };
      var __dirname = './simulator';
      (function() {
  var Expression, NumberExpression,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Expression = require('simulator/expression').Expression;

  Expression.register_type('integer', NumberExpression = (function(_super) {

    __extends(NumberExpression, _super);

    function NumberExpression() {
      NumberExpression.__super__.constructor.apply(this, arguments);
    }

    NumberExpression.prototype.evaluate = function() {
      if (!this.rvalue) return this.lvalue;
      switch (this.op) {
        case 'plus':
          return this.lvalue + this.rvalue;
        case 'minus':
          return this.lvalue - this.rvalue;
        default:
          throw new Error("Invalid integer operation: " + this.op);
      }
    };

    return NumberExpression;

  })(Expression));

}).call(this);

      return exports;
    });
    
    _require['simulator/string_expression'] = (function() {
      var exports = this;
      _require['simulator/string_expression'] = function() { return exports; };
      var __dirname = './simulator';
      (function() {
  var Expression, Format, StringExpression,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Expression = require('simulator/expression').Expression;

  Format = require('simulator/formatters').Format;

  Expression.register_type('string', StringExpression = (function(_super) {

    __extends(StringExpression, _super);

    function StringExpression() {
      StringExpression.__super__.constructor.apply(this, arguments);
    }

    StringExpression.prototype.evaluate = function() {
      var lval, rval;
      switch (this.op) {
        case 'plus':
          return this.lvalue.toString() + this.rvalue.toString();
        case 'minus':
          rval = parseInt(this.rvalue);
          lval = this.lvalue.toString();
          if (rval.toString() !== this.rvalue.toString()) {
            throw new Error("Can only subtract numeric values from String");
          }
          if (rval > 0) {
            return lval.substring(0, lval.length - rval);
          } else {
            return lval.substring(-rval, lval.length);
          }
          break;
        case 'item':
          rval = parseInt(this.rvalue);
          lval = this.lvalue.toString().split(';');
          if (rval < 0 || rval >= lval.length) {
            return ';';
          } else {
            return lval[rval];
          }
          break;
        case 'number':
          if (this.lvalue.toString() === "") {
            return 0;
          } else {
            return this.lvalue.toString().split(';').length;
          }
          break;
        case 'format':
          return new Format('string', this.rvalue.toString(), this.lvalue.toString()).process();
        default:
          if (this.format) {
            return new Format('string', this.format, this.lvalue.toString()).process();
          } else {
            if (this.op) {
              throw new Error("Invalid string operation: " + this.op);
            } else {
              return this.lvalue.toString();
            }
          }
      }
    };

    return StringExpression;

  })(Expression));

}).call(this);

      return exports;
    });
    
    _require['tml'] = (function() {
      var exports = this;
      _require['tml'] = function() { return exports; };
      var __dirname = './.';
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

      return exports;
    });
    
    _require['tml_builder'] = (function() {
      var exports = this;
      _require['tml_builder'] = function() { return exports; };
      var __dirname = './.';
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

    Screen.prototype.call_method = function(name, return_target) {
      var method_uri, next, return_target_uri;
      return_target_uri = uri_for(return_target);
      method_uri = uri_for(name);
      next = this.next();
      this.root.add_return_screen();
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
      this.b('next', {
        uri: method_uri
      });
      return this.root.screen(return_target, {
        next: next.attrs.uri
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
      return this._current_screen = screen_id;
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

      return exports;
    });
    
    _require['variable_scope'] = (function() {
      var exports = this;
      _require['variable_scope'] = function() { return exports; };
      var __dirname = './.';
      (function() {
  var Builtins, Scope, Variable, debug;

  Builtins = function(scope) {
    var key, _results;
    _results = [];
    for (key in scope.defs) {
      _results.push(key);
    }
    return _results;
  };

  debug = function(mesg) {
    if (process.env['DEBUG']) return console.log(mesg);
  };

  exports.Variable = Variable = (function() {

    function Variable(name, _type, method) {
      this.name = name;
      this._type = _type != null ? _type : null;
      this.method = method != null ? method : false;
      debug("Created variable " + this.name + (this._type ? " with type " + this._type : ""));
      this.dependents = [];
    }

    Variable.prototype.depends_upon = function(other_variable) {
      if (!(other_variable === this || other_variable.type() === 'string')) {
        debug("type of " + this.name + " depends upon " + other_variable.name);
        return this.dependents.push(other_variable);
      }
    };

    Variable.prototype.is_method_reference = function() {
      return this.last_known_value && this.last_known_value.indexOf('#') === 0;
    };

    Variable.prototype.type = function() {
      var dep, type, _i, _len, _ref, _t;
      if (this._type === null && this.dependents.length > 0) {
        type = null;
        _ref = this.dependents;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          dep = _ref[_i];
          _t = dep.type();
          if (_t) {
            if (_t !== 'string') {
              return _t;
            } else {
              type = 'string';
            }
          }
        }
        return type;
      } else {
        return this._type;
      }
    };

    Variable.prototype.default_value = function() {
      switch (this.type()) {
        case 'string':
        case null:
          return '';
        default:
          return 0;
      }
    };

    Variable.prototype.setType = function(type, silenced, raise_warnings) {
      var message;
      if (silenced == null) silenced = false;
      if (raise_warnings == null) raise_warnings = false;
      if (this.type() !== null && type !== null) {
        if (this.type() !== type && this._type !== 'string') {
          message = "" + type + " variable " + this.name + " conflicts with a " + (this.type()) + " variable of the same name";
          if (raise_warnings) throw new Error(message);
          if (!silenced) console.log("Warning: " + message);
        }
      }
      if (this._type !== type) {
        debug("set type of " + this.name + " to " + type);
        return this._type = type;
      }
    };

    return Variable;

  })();

  exports.VariableScope = Scope = (function() {

    function Scope(prefix, parent) {
      if (prefix == null) prefix = null;
      this.parent = parent != null ? parent : null;
      this._prefix = (prefix ? "" + prefix + "." : "");
      this.defs = {};
      this.builtin = Builtins(this);
      this.subscopes = {};
    }

    Scope.prototype.to_simulator_scope = function(sim) {
      var def, localname, prefix, subscope, _ref, _ref2;
      if (sim == null) sim = {};
      _ref = this.defs;
      for (localname in _ref) {
        def = _ref[localname];
        sim[def.name] = {
          type: def.type(),
          value: def.default_value()
        };
      }
      _ref2 = this.subscopes;
      for (prefix in _ref2) {
        subscope = _ref2[prefix];
        subscope.to_simulator_scope(sim);
      }
      return sim;
    };

    Scope.prototype.prefix = function() {
      if (this.parent) {
        return this.parent.prefix() + this._prefix;
      } else {
        return this._prefix;
      }
    };

    Scope.prototype.warnings_silenced = function() {
      if (this._warnings_silenced) return true;
      if (this.parent) return this.parent.warnings_silenced();
      return false;
    };

    Scope.prototype.silence_warnings = function() {
      return this._warnings_silenced = true;
    };

    Scope.prototype.warnings_raised = function() {
      if (this._raise_warnings) return true;
      if (this.parent) return this.parent.warnings_raised();
      return false;
    };

    Scope.prototype.raise_warnings = function() {
      return this._raise_warnings = true;
    };

    Scope.prototype.define = function(name, type, method) {
      var qualified_name, variable;
      if (type == null) type = null;
      if (method == null) method = false;
      if (name.indexOf(".") === 0) {
        return this.root().define(name.slice(1), type, method);
      }
      qualified_name = this.prefix() + name;
      variable = this.find(name);
      if (variable) {
        if (type !== null) {
          variable.setType(type, this.warnings_silenced(), this.warnings_raised());
        }
      } else {
        this.defs[name] = variable = new Variable(qualified_name, type, method);
      }
      return variable;
    };

    Scope.prototype.silently_define = function(name, type, method) {
      var variable;
      if (type == null) type = null;
      if (method == null) method = false;
      if (name.indexOf(".") === 0) {
        return this.root().silently_define(name.slice(1), type, method);
      }
      variable = this.find(name);
      if (variable) {
        if (variable.type === null) variable.setType(type, true);
      } else {
        this.defs[name] = variable = new Variable(this.prefix() + name, type, method);
      }
      return variable;
    };

    Scope.prototype.type_of = function(value) {
      return value.type();
    };

    Scope.prototype.recalculate = function() {
      var def, localname, prefix, subscope, _ref, _ref2, _results;
      _ref = this.defs;
      for (localname in _ref) {
        def = _ref[localname];
        def.name = this.prefix() + localname;
      }
      _ref2 = this.subscopes;
      _results = [];
      for (prefix in _ref2) {
        subscope = _ref2[prefix];
        _results.push(subscope.recalculate());
      }
      return _results;
    };

    Scope.prototype.find = function(name, downward) {
      var def, localname, prefix, scope, _ref, _ref2;
      if (downward == null) downward = false;
      if (name.indexOf(".") === 0) {
        return this.root().find(name.slice(1), downward);
      }
      _ref = this.defs;
      for (localname in _ref) {
        def = _ref[localname];
        if (def.name === name || localname === name) return def;
      }
      if (this.parent && !downward) return this.parent.find(name, false);
      _ref2 = this.subscopes;
      for (prefix in _ref2) {
        scope = _ref2[prefix];
        prefix = this.prefix() + prefix;
        if (name.indexOf(prefix) === 0) return scope.find(name, true);
      }
      return null;
    };

    Scope.prototype.root = function() {
      var p, _p;
      p = this;
      _p = p.parent;
      while (_p) {
        p = _p;
        _p = p.parent;
      }
      return p;
    };

    Scope.prototype.tree = function() {
      return this.root().dump();
    };

    Scope.prototype.dump = function() {
      var localname, prefix, subscope, variable, _ref, _ref2, _results;
      _ref = this.defs;
      for (localname in _ref) {
        variable = _ref[localname];
        console.log(this.prefix() + localname + " => " + variable.name);
      }
      _ref2 = this.subscopes;
      _results = [];
      for (prefix in _ref2) {
        subscope = _ref2[prefix];
        _results.push(subscope.dump());
      }
      return _results;
    };

    Scope.prototype.lookup = function(name) {
      var v;
      if (!name) throw new Error("No name given");
      if (v = this.find(name)) return v;
      throw new Error("" + (/\./.test(name) ? name : this.prefix() + name) + " is not defined");
    };

    Scope.prototype.sub = function(prefix) {
      var scope;
      if (!prefix) throw new Error("Can't subscope without a prefix");
      if (prefix[0] === '.') return this.root().sub(prefix.slice(1));
      scope = new Scope(prefix, this);
      return this.subscopes[scope.prefix()] = scope;
    };

    Scope.prototype.compile = function(builder) {
      var name, prefix, scope, variable, _ref, _ref2;
      if (builder.root) builder = builder.root;
      _ref = this.defs;
      for (name in _ref) {
        variable = _ref[name];
        builder.vardcl(variable.name, variable.type() || "string");
      }
      _ref2 = this.subscopes;
      for (prefix in _ref2) {
        scope = _ref2[prefix];
        scope.compile(builder);
      }
      return builder;
    };

    return Scope;

  })();

}).call(this);

      return exports;
    });
    
    _require['view_template'] = (function() {
      var exports = this;
      _require['view_template'] = function() { return exports; };
      var __dirname = './.';
      (function() {
  var Assign, Identifier, Layout, Literal, MethodCall, Variable, ViewTemplate, fs, path,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Variable = require('variable_scope').Variable;

  Assign = require('nodes/assign').Assign;

  Identifier = require('nodes/identifier').Identifier;

  MethodCall = require('nodes/method_call').MethodCall;

  Literal = require('nodes/literal').Literal;

  path = require('path');

  fs = require('fs');

  exports.ViewTemplate = ViewTemplate = (function() {
    var read_template_from_path, varid;

    varid = 0;

    read_template_from_path = function(filepath) {
      var _base;
      if (!path.extname(filepath)) filepath = "" + filepath + ".xml";
      try {
        return (_base = ViewTemplate.views)[filepath] || (_base[filepath] = new ViewTemplate(fs.readFileSync(filepath, 'UTF-8')));
      } catch (e) {
        return null;
      }
    };

    ViewTemplate.find = function(filename) {
      var filepath, template, view_path, view_paths, _i, _len;
      view_paths = ViewTemplate.paths();
      ViewTemplate.views || (ViewTemplate.views = {});
      if (filename[0] === /[//\\]/) {
        return read_template_from_path(filename);
      } else {
        for (_i = 0, _len = view_paths.length; _i < _len; _i++) {
          view_path = view_paths[_i];
          if (view_path[0] === '.') {
            view_path = path.join(process.cwd(), view_path);
          }
          filepath = path.normalize(path.join(view_path, filename));
          template = read_template_from_path(filepath);
          if (template) return template;
        }
      }
      throw new Error("Could not find view \"" + filename + "\" in view paths " + (JSON.stringify($.view_paths)));
    };

    ViewTemplate.paths = function() {
      return $.view_paths;
    };

    function ViewTemplate(content) {
      this.content = content;
    }

    ViewTemplate.prototype.each_match = function(start_token, stop_token, content, callback) {
      var match, start, stop;
      while ((start = content.indexOf(start_token)) !== -1) {
        stop = content.indexOf(stop_token);
        if (stop === -1 || stop < start) {
          throw new Error("Unmatched " + start_token);
        }
        match = content.substring(start + start_token.length, stop);
        content = content.replace(start_token + match + stop_token, callback(match));
      }
      return content;
    };

    ViewTemplate.prototype.create_id = function() {
      return this.context.create(Identifier, "embedded_" + (varid++));
    };

    ViewTemplate.prototype.process_code = function(code) {
      return this.context.create(MethodCall, this.context.create(Identifier, 'eval'), [this.context.create(Literal, code.trim())]);
    };

    ViewTemplate.prototype.assign_code_eval = function(code) {
      var assign, id, result;
      result = this.process_code(code).compile(this.builder);
      if (result instanceof Variable) {
        id = this.create_id();
        assign = this.context.create(Assign, id, this.context.create(Identifier, result.name));
        assign.compile(this.builder);
        return "<getvar name=\"" + result.name + "\" />";
      } else {
        return result;
      }
    };

    ViewTemplate.prototype.process_embedded_values = function(content) {
      var _this = this;
      return this.each_match('<%=', '%>', content, function(match) {
        return _this.assign_code_eval(match);
      });
    };

    ViewTemplate.prototype.process_embedded_code = function(content) {
      var _this = this;
      return this.each_match('<%', '%>', content, function(code) {
        var call;
        call = _this.process_code(code);
        call.compile(_this.builder);
        return "";
      });
    };

    ViewTemplate.prototype.process = function(context, builder) {
      var content;
      this.context = context;
      this.builder = builder;
      content = this.process_embedded_values(this.content);
      content = this.process_embedded_code(content);
      return content;
    };

    return ViewTemplate;

  })();

  exports.Layout = Layout = (function(_super) {

    __extends(Layout, _super);

    function Layout() {
      Layout.__super__.constructor.apply(this, arguments);
    }

    return Layout;

  })(ViewTemplate);

}).call(this);

      return exports;
    });
    

    return require('tml');
  })();

  if (typeof define === 'function' && define.amd) {
    define(function() { return Ambrosia; });
  } else { 
    root.Ambrosia = Ambrosia; 
  }
})(this);

console.log(Ambrosia.compile('a=1').toString())
}, function(program) {
  var output, print = function(string) {
    process.stdout.write('' + string);
  };
  try {
    result = program();
    if (typeof result == 'undefined' && result !== null) {
      print('["ok"]');
    } else {
      try {
        print(JSON.stringify(['ok', result]));
      } catch (err) {
        print('["err"]');
      }
    }
  } catch (err) {
    print(JSON.stringify(['err', '' + err]));
  }
});
