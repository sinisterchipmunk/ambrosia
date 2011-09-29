require './spec_helper'

describe "methods", ->
  doc = null
  
  describe "a single empty method", ->
    beforeEach -> doc = dom("init:")

    it "should produce a <screen> element with id 'init'", ->
      expect(doc.first "screen", id:'init').toBeTruthy()
      
  describe "a one-liner", ->
    beforeEach -> doc = dom "init: something = 1"
    
    it "should set something to 1", ->
      sim = simulate doc
      sim.goto "#init"
      sim.start (sim) ->
        expect(sim.state.variables.something.value).toEqual(1)
  
  describe "an implicit function call from main", ->
    sim = null
    beforeEach ->
      doc = dom "main: result = other\nother: return 1"
      # console.log doc.toString()
      
      # FIXME we need a better way to set stop conditions. Breakpoints?
      x = 30
      sim = simulate doc, (sim) ->
        # console.log sim.state.screen.id, sim.state.variables;
        (--x) != 0
      
    it "should return from function with value 1", ->
      expect(sim.state.variables.result.value).toEqual 1

  describe "an explicit function call from main", ->
    sim = null
    beforeEach ->
      doc = dom "main: result = other()\nother: return 1"
      x = 30
      sim = simulate doc, (sim) -> (--x) != 0

    it "should return from function with value 1", ->
      expect(sim.state.variables.result.value).toEqual 1

