require '../spec_helper'

describe "keypad input", ->
  doc = sim = null
  
  describe "with a display", ->
    beforeEach ->
      doc = dom """
      a = 1
      display '../spec/fixtures/views/basic-embedded-variable'
      b = getch('1')
      """
      # console.log doc.toString()
      sim = simulate doc
      sim.start()
    
    it "should set b to 1", ->
      sim.press '1'
      expect(sim.state.variables.b.value).toEqual '1'
  
  describe "with default key set", ->
    beforeEach ->
      doc = dom "a = getch()"
      sim = simulate doc
      sim.start()
    
    it "should set a to 1", ->
      # console.log doc.toString()
      sim.press '1'
      expect(sim.state.variables.a.value).toEqual '1'
    
    it "should set a to 2", ->
      sim.press '2'
      expect(sim.state.variables.a.value).toEqual '2'
    
  describe 'with custom key set', ->
    beforeEach ->
      doc = dom "a = getch('2')"
      sim = simulate doc
      sim.start()
    
    it "should set a to 1", ->
      # console.log doc.toString()
      sim.press '1'
      expect(sim.state.variables.a.value).not.toEqual '1'
    
    it "should set a to 2", ->
      sim.press '2'
      expect(sim.state.variables.a.value).toEqual '2'
