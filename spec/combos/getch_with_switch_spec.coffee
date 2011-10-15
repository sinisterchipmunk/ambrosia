require '../spec_helper'

describe "getch with switch combo", ->
  doc = sim = null
  beforeEach ->
    doc = dom """
    a = 0
    switch getch('f1 f3')
      when 'f1' then a = 1
      when 'f3' then a = 2
    """
    # console.log doc.toString()
    sim = simulate doc
  
  describe "when f1 is pressed", ->
    beforeEach ->
      sim.start()
      sim.press 'f1'
      
    it "should set a to 1", ->
      expect(sim.state.variables.a.value).toEqual 1

  describe "when f3 is pressed", ->
    beforeEach ->
      sim.start()
      sim.press 'f3'

    it "should set a to 2", ->
      expect(sim.state.variables.a.value).toEqual 2
