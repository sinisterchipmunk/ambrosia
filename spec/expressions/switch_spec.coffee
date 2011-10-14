require '../spec_helper'

describe "switch", ->
  doc = sim = null
  beforeEach ->
    doc = dom """
    i = j = 0
    switch i
      when 0 then j = 1
      when 1
        j = 2
      else j = 3
    """
    # console.log doc.toString()
    sim = simulate doc
  
  describe "with i == 0", ->
    it "should set j to 1", ->
      sim.start()
      expect(sim.state.variables.j.value).toEqual 1
      
  describe "with i == 1", ->
    it "should set j to 2", ->
      sim.state.variables.i.value = 1
      sim.start()
      
      expect(sim.state.variables.j.value).toEqual 2

  describe "with i == 2", ->
    it "should set j to 3", ->
      sim.state.variables.i.value = 2
      sim.start()

      expect(sim.state.variables.j.value).toEqual 3