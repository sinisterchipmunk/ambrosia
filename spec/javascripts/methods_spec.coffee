require 'spec_helper'

describe "methods", ->
  doc = sim = null
  
  it "should not double next after display", ->
    # basically we are ending up with more than 1 <next> element,
    # which fails validation out of the gate.
    doc = dom """
      a = 0
      one:
        a = 1
      two:
        display "test"
        one()
      two()
    """
    
    # it's very brittle to directly check the number of <next> elements
    # so let's pass it into the simulator and verify proper operation
    # instead.
    # console.log doc.toString()
    sim = simulate doc
    sim.start()
    sim.press("enter") # to move past the display
    expect(sim.state.variables.a.value).toEqual 1
    
  it "should not loop indefinitely if call stack is empty", ->
    # not sure how to reproduce this 'properly' but here is a contrived
    # example of what is happening. Note the missing ';' from call.stack.
    doc = dom "one = 0\nother: one = 1\nc = -> call.stack = '#other'\nc()"
    # console.log doc.toString()
    sim = simulate doc
    sim.start()
    expect(sim.state.variables.one.value).toEqual 1
    
  describe "with void return", ->
    beforeEach ->
      code = """
      two = 0
      one()

      one:
        return
        two = 1
      """
      doc = dom code
      count = 2
      sim = simulate doc, (sim) ->
        count -= 1 if sim.state.screen.id == '__main__'
        return count > 0

    it "should set two to 0", ->
      expect(sim.state.variables.two.value).toEqual 0
      
  describe "called from method reference", ->
    beforeEach ->
      code = """
      _method = :meth
      _method()
      
      meth:
        two = 2
      """
      doc = dom code
      sim = simulate doc, (sim) ->
        return false if sim.state.screen.id == '__shift_last__' and sim.state.variables['call.stack'].value == ''
        true

    it "should set two to 2", ->
      expect(sim.state.variables['meth.two'].value).toEqual 2
  
  describe "multiple calls from main", ->
    beforeEach ->
      code = """
      one: return 1
      two: return 2

      _one = one()
      _two = two()
      """
      doc = dom code
      # console.log doc.toString()
      count = 2
      sim = simulate doc, (sim) ->
        count -= 1 if sim.state.screen.id == '__main__'
        return count > 0
    
    it "should set _one to 1, _two to 2", ->
      expect(sim.state.variables._one.value).toEqual 1
      expect(sim.state.variables._two.value).toEqual 2
      
  describe "a method returing a string", ->
    beforeEach ->
      count = 2
      doc = dom 'init: return "one"\n_one = init()'
      sim = simulate doc, (sim) ->
        count -= 1 if sim.state.screen.id == '__main__'
        return count > 0
    
    it "should set _one to 'one'", ->
      expect(sim.state.variables._one.value).toEqual 'one'
  
  describe "a single empty method", ->
    beforeEach -> doc = dom("init:\ninit()")

    it "should produce a <screen> element with id 'init'", ->
      expect(doc.first "screen", id:'init').toBeTruthy()
      
  describe "a one-liner", ->
    beforeEach -> doc = dom "init: something = 1\ninit()"
    
    it "should set something to 1", ->
      sim = simulate doc
      sim.goto "#init"
      sim.start (sim) ->
        expect(sim.state.variables['init.something'].value).toEqual(1)
  
  describe "a method call from main", ->
    sim = null
    beforeEach ->
      doc = dom "result = other()\nother: return 1"
      
      # result = other()
      #   
      # other:
      #   return 1
      #   
      # console.log doc.toString()
      
      # FIXME we need a better way to set stop conditions. Breakpoints?
      x = 30
      sim = simulate doc, (sim) -> (--x) != 0
      
    it "should return from function with value 1", ->
      expect(sim.state.variables.result.value).toEqual 1
