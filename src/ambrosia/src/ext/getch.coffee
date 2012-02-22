{Document} = require 'nodes/document'

Document.preprocessor 'getch',
  (builder, keys = '0 1 2 3 4 5 6 7 8 9 f1 f2 f3 f4 f5 f6 f7 f8 f9 up down menu stop enter cancel') ->
    result = @current_scope().define '.last_key_pressed'

    screen = builder.current_screen()

    for i in keys.split /\s/
      key_screen = screen.branch key: "#{i}"
      key_screen.b 'setvar', name: 'last_key_pressed', lo: "#{i}"
    
    screen.branch_merge()
    result
  