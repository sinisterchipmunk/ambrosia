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
