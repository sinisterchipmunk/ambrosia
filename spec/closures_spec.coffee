require './spec_helper'

describe "closures", ->
  doc = null
  describe "without arguments", ->
    beforeEach -> 
      doc = dom "one = 0\na = -> one = 1\na()"
    
    it "should set one to 1", ->
      sim = simulate doc, (sim) -> not /__main___/.test sim.state.screen.id
      expect(sim.state.variables.one.value).toEqual 1

  describe "with arguments", ->
    beforeEach -> 
      doc = dom "one = 0\na = (p) -> one = p\na 2"
      # console.log doc.toString()

    it "should set one to 2", ->
      sim = simulate doc, (sim) -> not /__main___/.test sim.state.screen.id
      expect(sim.state.variables.one.value).toEqual 2

  describe "with empty arguments", ->
    beforeEach -> 
      doc = dom "one = 0\na = () -> one = 1\na()"

    it "should set one to 1", ->
      # console.log doc.toString()
      sim = simulate doc, (sim) -> not /__main___/.test sim.state.screen.id
      # console.log sim.state.variables
      expect(sim.state.variables.one.value).toEqual 1
