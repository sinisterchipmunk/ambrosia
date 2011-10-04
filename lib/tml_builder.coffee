{Builder} = require './builder'

# Names are registered here so that they can be converted into unique integer IDs.
# This requires fewer characters as a string (as the max ID length is 32).
#
# Method names and __main__ are left unchanged, but screens inserted in between
# (for instance, after a function call returns) will be mangled appropriately.
# 
# Usage:
#    NameRegistry.register('name') #=> a unique integer ID
exports.NameRegistry = class NameRegistry
  @unique_id: 0
  @registry: {}
  @register: (name) ->
    NameRegistry.registry[name] or= NameRegistry.unique_id++

Builder.screen = class Screen extends Builder
  call_method: (name, return_target) ->
    # create the call stack if it doesn't exist already
    @root.add_return_screen()
    # insert the destination _following_ the method call into the call stack
    @b 'setvar', name: 'call.stack', lo: ";", op: "plus", ro: "tmlvar:call.stack"
    @b 'setvar', name: 'call.stack', lo: "##{return_target}", op: "plus", ro: "tmlvar:call.stack"
    # direct the current screen into the method screen
    @b 'next', uri: "##{name}"
    # build the screen that will take over operation after the method call returns
    @root.screen return_target

exports.TMLBuilder = class TMLBuilder extends Builder 
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
    if id
      if id.length > 32
        throw new Error "ID '#{id}' exceeds 32 characters"
      attrs.id = id
      @_current_screen = id
    attrs.next or= "#__return__"
      
    # merge existing screens
    if attrs.id and scr = @first("screen", id: id)
      for i in attrs
        scr.attrs[i] or= attrs[i]
      return scr
    else
      @insert 'screen', attrs, inner, after: 'screen'
    
    # if attrs.id and scr = @first("screen", id: id)
    #   # replace existing screens
    #   @remove scr
    # attrs.next or= "#__return__"
    # @insert('screen', attrs, inner, after: 'screen')
    
  current_screen: -> @root.first 'screen', id: @_current_screen
  
  goto: (screen_id) -> @_current_screen = screen_id

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
  