require './spec_helper'

describe "expressions", ->
  doc = sim = null
  
  describe "increment", ->
    beforeEach ->
      doc = dom 'i = 0; i++'
      sim = simulate doc, (sim) -> false

    it "should set i to 1", ->
      expect(sim.state.variables.i.value).toEqual 1

  describe "decrement", ->
    beforeEach ->
      doc = dom 'i = 0; i--'
      sim = simulate doc, (sim) -> false

    it "should set i to -1", ->
      expect(sim.state.variables.i.value).toEqual -1

  describe "unary -", ->
    it "should set one to -1", ->
      doc = dom 'one = -1'
      c = 1
      sim = simulate doc, (sim) -> return c-- == 0
      expect(sim.state.variables.one.value).toEqual -1
      
    it "should set one to 2", ->
      doc = dom 'one = 1 - -1'
      c = 1
      sim = simulate doc, (sim) -> return c-- == 0
      expect(sim.state.variables.one.value).toEqual 2
    
  describe "list index", ->
    beforeEach ->
      doc = dom 'list = "one;two"; one = list[0]'
      sim = simulate doc
      sim.start()
    
    it "should set one to list item 0", ->
      expect(sim.state.variables.one.value).toEqual 'one'
      
  describe "parentheticals", ->
    beforeEach ->
      doc = dom 'one = 1 + (2 + 3)'
      sim = simulate doc
      sim.start()
      
    it "should produce the correct result", ->
      expect(sim.state.variables.one.value).toEqual 6
