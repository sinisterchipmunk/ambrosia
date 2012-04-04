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
      subscope = this.current_scope().root();
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
