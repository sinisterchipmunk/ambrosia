(function() {
  var Document, add_require;

  Document = require('nodes/document').Document;

  add_require = function(head, path, rev) {
    if (rev) {
      rev = (function() {
        switch (rev) {
          case 'tml':
            return 'text/tml';
          case 'css':
            return 'stylesheet';
          default:
            return rev;
        }
      })();
    } else {
      if (/\.css$/.test(path)) {
        rev = 'stylesheet';
      } else {
        rev = 'text/tml';
      }
    }
    return head.b('link', {
      href: path,
      rev: rev
    });
  };

  Document.preprocessor('require', function(builder, path, rev) {
    var head;
    if (head = builder.first('head')) {
      add_require(head, path, rev);
    } else {
      add_require(builder.b('head'), path, rev);
    }
    return "";
  });

}).call(this);
