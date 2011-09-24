require './spec_helper'

describe "Simulator", ->
  doc = null
  beforeEach -> doc = build('tml')
  
  it "should raise error given no screens", ->
    expect(-> simulate doc, -> false).toThrow("No screens found!")
    
  describe "with variables declared", ->
    describe "with default value", ->
      beforeEach ->
        doc.b 'vardcl', name: 'one', value: '1', type: 'integer'
        doc.b 'screen', id: 'init'
      
      it "should set value to 1", ->
        simulate doc, (sim) ->
          expect(sim.state.variables.one.value).toEqual 1
  
      describe "with value assigned by screen", ->
        beforeEach -> doc.first('screen').b 'setvar', name: 'one', lo: '2'
    
        it "should set value to 2", ->
          simulate doc, (sim) ->
            expect(sim.state.variables.one.value).toEqual 2

      describe "with value calculated by screen", ->
        beforeEach -> doc.first('screen').b 'setvar', name: 'one', lo: '2', op: 'plus', ro: '3'

        it "should set value to 5", ->
          simulate doc, (sim) ->
            expect(sim.state.variables.one.value).toEqual 5
    
  describe "with a screen leading to another via <next>", ->
    beforeEach ->
      doc.b 'screen', id: 'init', (b) -> b.b 'next', uri: '#other'
      doc.b 'screen', id: 'other'
    
    it "should follow the <next>", ->
      timeout = 10
      found = false
      simulate doc, (sim) ->
        if sim.state.screen.id == 'init'
          timeout -= 1
          return timeout > 0
        else
          found = true
          return false
      expect(found).toBeTruthy()
    
  describe "with a single screen", ->
    beforeEach -> doc.b 'screen', id: 'init'
    
    it "should call callback", ->
      called = false
      simulate doc, -> called = true; false
      expect(called).toBeTruthy()
      
    it "should be on that screen at start", ->
      simulate doc, (sim) ->
        expect(sim.state.screen.id).toEqual 'init'
        false
        
    it "should raise an error if no next screen exists", ->
      expect(-> simulate doc, (sim) -> true).toThrow("Cannot step forward: screen 'idle' is a dead end!")
        
    it "should raise an error jumping to nonexistent screens", ->
      expect(-> simulate doc, (sim) -> sim.goto "missing").toThrow("Screen 'missing' not found!")
