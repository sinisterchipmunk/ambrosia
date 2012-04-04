(function() {
  var Document, Literal;

  Document = require('nodes/document').Document;

  Literal = require('nodes/literal').Literal;

  Document.preprocessor('check_card', function(builder) {
    var screen;
    screen = builder.root.current_screen().extend();
    screen.b('tform', function(tform) {
      return tform.b('card', {
        parser: 'mag',
        parser_params: 'risk_mgmt'
      });
    });
    return this.create(Literal, "");
  });

}).call(this);
