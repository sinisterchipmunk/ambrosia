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
