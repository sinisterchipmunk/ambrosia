{Base} = require 'nodes/base'
build_dom_from = require('dom').build_dom_from

exports.EmbeddedTML = class EmbeddedTML extends Base
  # type: -> @rvalue.type()
  
  children: -> ['tml']
  # get_dependent_variable: -> @lvalue.get_dependent_variable()
  to_code: -> "`\n#{@tml}\n`"
  prepare: ->
  compile: (screen) ->
    # This code is largely reproduced in ../ext/display.coffee
    # TODO refactor to DRY
    # dom = create_dom @tml
    screen = screen.root.current_screen()
    build_dom_from @tml, screen
    
    ""
