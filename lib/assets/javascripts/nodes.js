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
