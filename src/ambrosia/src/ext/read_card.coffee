{Document} = require 'nodes/document'

Document.preprocessor 'read_card',
  (builder, card_type) ->
    card_types = (if card_type then card_type.split(/\s+/) else [])
    result = @import builder, 'std/card_parser'

    builder.current_screen().b 'tform', (b) ->
      for type in card_types
        switch type
          when 'mag', 'magnetic'
            parser = 'mag'
            params = 'read_data'
          when 'emv'
            throw new Error "EMV is not supported yet"
          else throw new Error "Expected card reader type to be 'magnetic', 'emv', or both; found #{type}"
        b.b 'card', parser: parser, parser_params: params
        
    result
