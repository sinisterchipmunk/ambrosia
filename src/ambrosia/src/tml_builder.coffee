{Builder} = require 'builder'

uri_for = (path) ->
  if /^tmlvar:/.test path then path else "##{path}"

# Names are registered here so that they can be converted into unique integer IDs.
# This requires fewer characters as a string (as the max ID length is 32).
#
# Method names and __main__ are left unchanged, but screens inserted in between
# (for instance, after a function call returns) will be mangled appropriately.
# 
# Usage:
#    NameRegistry.register('name') #=> a unique integer ID
#
exports.NameRegistry = class NameRegistry
  validate = (m) ->
    if m.length > 32 then throw new Error "ID #{m} exceeds maximum 32 characters!"
    m
  
  constructor: ->
    @unique_id = 0
    @registry = {}
    @counters = {}
    
  register: (name) -> @registry[name] or= @unique_id++
  
  increment: (name) ->
    @counters[name] or= 0
    validate name + "_" + @counters[name]++

Builder.screen = class Screen extends Builder
  extend: () ->
    @source_id or= @attrs.id
    new_id = @root.name_registry.increment @source_id
    next_screen = @root.screen new_id
    next_screen.source_id = @source_id
    if next = @first 'next'
      variants = next.all 'variant'
    next = next_screen.b 'next', uri: @next().attrs.uri, (b) ->
      b.b 'variant', v.attrs for v in variants if variants
    @remove 'next'
    @attrs.next = '#' + next_screen.attrs.id
    next_screen
    
  # returns true if this screen is an output screen that implicitly
  # waits for user input before continuing. Note that this does _not_
  # include screens that contain hotkey variants.
  is_wait_screen: () ->
    return true if @first 'display' or @first 'print'
    false
  
  variants: () ->
    if next = @first 'next'
      next.all 'variant'
    else
      []
      
  next: () ->
    return @first('next') or {attrs:uri:@attrs.next}
    
  b: ->
    result = super
    if @first 'next'
      delete @attrs.next # for readability
    result
  
  branch: (operation) ->
    unless next = @first 'next'
      next = @b 'next', uri: @attrs.next

    # the merge screen is where the conditional ends, and program flow resumes normally.
    @merge_to = @root.screen @attrs.id + "_merge", next: next.attrs.uri
    next.attrs.uri = "##{@merge_to.attrs.id}"
    
    if operation.key then base_id = @attrs.id + "_key"
    else base_id = @attrs.id + "_if"
    new_screen_id = @root.name_registry.increment base_id
    new_screen_uri = uri_for new_screen_id
    operation.uri = new_screen_uri
    next.b 'variant', operation
    scr = @root.screen new_screen_id, next: next.attrs.uri
    scr._branched_from = this
    scr.merge_to = @merge_to
    scr
  
  branch_else: ->
    new_screen_id = @_branched_from.attrs.id + "_else"
    scr = @root.screen new_screen_id, next: @_branched_from.next().attrs.uri
    scr.merge_to = @_branched_from.merge_to
    @_branched_from.next().attrs.uri = "#" + new_screen_id
    scr
    
  branch_merge: ->
    @root.goto @merge_to.attrs.id
    @merge_to
  
  call_method: (name, return_target) ->
    return_target_uri = uri_for return_target
    method_uri = uri_for name
    
    next_uri = @next().attrs.uri
    # create the call stack if it doesn't exist already
    @root.add_return_screen()
    # insert the destination _following_ the method call into the call stack
    @b 'setvar', name: 'call.stack', lo: ";", op: "plus", ro: "tmlvar:call.stack"
    @b 'setvar', name: 'call.stack', lo: "#{return_target_uri}", op: "plus", ro: "tmlvar:call.stack"
    # direct the current screen into the method screen
    next = @first('next') || @b 'next'
    next.attrs.uri = method_uri
    # build the screen that will take over operation after the method call returns
    @root.screen return_target, next: next_uri

exports.TMLBuilder = class TMLBuilder extends Builder 
  constructor: ->
    @name_registry = new NameRegistry
    super('tml', xmlns: "http://www.ingenico.co.uk/tml", cache: "deny")
    @b 'head', (b) ->
      b.b 'defaults', cancel: 'emb://embedded.tml'
    @screen '__main__', next: "#main"
  
  vardcl: (name, type = "string", value = null) ->
    if (vari = @first("vardcl", name: name))
      vari.attrs.type = type
      return

    attrs =
      name: name
      type: 'string'

    if type then attrs.type = type
    if value then attrs.value = value

    @insert('vardcl', attrs, before: 'screen')

  screen: (id = null, attrs = {}, inner = null) ->
    if typeof(id) == 'object' then throw new Error("expected screen ID, got #{JSON.stringify id}")
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

  current_screen: -> @root.first 'screen', id: @_current_screen
  
  goto: (screen_id) ->
    if screen_id.attrs
      @_current_screen = screen_id.attrs.id
    else
      @_current_screen = screen_id

  # Manages a simple call stack in TML and helps return from method calls
  add_return_screen: ->
    # only do this once
    return if @first("screen", id:'__return__') != undefined

    @vardcl 'call.stack_shift', 'string'

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
  