builder = require './builder'

exports.TMLBuilder = class TMLBuilder extends builder.Builder 
  constructor: ->
    super('tml', xmlns: "http://www.ingenico.co.uk/tml", cache: "deny")
    @b 'head', (b) ->
      b.b 'defaults', cancel: 'emb://embedded.tml'
    @screen '__main__', next: "#main"
  
  vardcl: (name, type = "string", value = null) ->
    if (vari = @first("vardcl", name: name))
      if vari.attrs.type != type
        throw new Error "Type mismatch: variable #{name} is a #{vari.attrs.type}, not a #{type}"
      else return

    attrs =
      name: name
      type: 'string'

    if type then attrs.type = type
    if value then attrs.value = value

    @insert('vardcl', attrs, before: 'screen')

  screen: (id = null, attrs = {}, inner = null) ->
    if typeof(attrs) == "function"
      inner = attrs
      attrs = {}
    attrs.id = id if id
    @insert('screen', attrs, inner, after: 'screen')

  # Manages a simple call stack in TML and helps return from method calls
  add_return_screen: ->
    # only do this once
    return if @first("vardcl", name:'call.stack_shift') != undefined

    @vardcl 'call.stack_shift', 'string'
    @vardcl 'call.stack',       'string'

    # modify the '__main__' screen to clear the call stack upon each visit
    main = @first("screen", id: "__main__")
    main.b 'setvar', name: 'call.stack', lo: ''

    # called when returning from a function. Figures out where to return to.
    @screen '__return__', (ret) ->
      ret.b 'next', uri: '#__shift_char__', (nxt) ->
        # if no items in stack, return to main; else, shift 1 character
        nxt.b 'variant', uri: '#__main__', lo: 'tmlvar:call.stack_shift', op:'equal', ro:''
      ret.b 'setvar', name: 'call.stack_shift', lo: 'tmlvar:call.stack', op:'item', ro:'0'

    # shifts 1 character out of the string. This is looped until the first character is the list delimeter, ';'
    @screen '__shift_char__', (shi) ->
      shi.b 'next', uri: '#__shift_char__', (nxt) ->
        nxt.b 'variant', uri: '#__shift_last__', lo: 'tmlvar:call.stack', op: 'equal', ro: ';', format: 'c'
      shi.b 'setvar', name: 'call.stack', lo: 'tmlvar:call.stack', op: 'minus', ro: '-1'

    # shifts the remaining ';' delimeter from the string, and then goes to the destination screen
    @screen '__shift_last__', (shi) ->
      # remove the ; from the beginning of the string, then go to the return destination
      shi.b 'next', uri: 'tmlvar:call.stack_shift'
      shi.b 'setvar', name: 'call.stack', lo: 'tmlvar:call.stack', op: 'minus', ro: '-1'
  