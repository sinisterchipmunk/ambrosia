require './spec_helper'

describe "Simulator", ->
  doc = sim = null
  beforeEach -> doc = build('tml')
  
  describe "key input", ->
    beforeEach ->
      doc.b 'vardcl', name: 'last_key', type: 'string'
      screen = doc.b 'screen', id: "init"
      screen.b 'setvar', name:'last_key', lo: ''
      doc.b 'screen', id: 'none'
      key1 = doc.b 'screen', id: 'key1', next: '#init'
      key1.b 'setvar', name: 'last_key', lo: '1'
      next = screen.b "next", uri: "#none"
      next.b 'variant', uri: '#key1', key: '1'
      
      sim = simulate doc
      # console.log doc.toString()
      sim.start()
    
    it "should wait at key input screen", ->
      expect(sim.state.screen.id).toEqual 'init'
      
    it "should continue immediately after recognized key input is received", ->
      sim.press "1"
      expect(sim.state.variables.last_key.value).toEqual "1"
      
    it "should continue immediately after unrecognized key input is received", ->
      sim.press "menu"
      expect(sim.state.screen.id).toEqual "none"
      expect(sim.state.variables.last_key.value).toEqual ""
      
    it "should puke if an invalid key is used", ->
      expect(-> sim.press "puke").toThrow "Invalid key: 'puke'"
      
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
      found = false
      simulate doc, (sim) ->
        return found = (sim.state.screen.id == 'other')
      expect(found).toBeTruthy()
      
  describe "with an infinite recursion screen", ->
    it "should raise an error", ->
      doc.b 'screen', id: 'init', next: '#other'
      doc.b 'screen', id: 'other', next: '#other'
      expect(-> simulate doc, (sim) -> true).toThrow()
    
  describe "with a single screen", ->
    beforeEach -> doc.b 'screen', id: 'init'
    
    it "should call callback", ->
      called = false
      simulate doc, -> called = true; false
      expect(called).toBeTruthy()
      
    it "should be on that screen at start", ->
      called = false
      simulate doc, (sim) ->
        called = true
        expect(sim.state.screen.id).toEqual 'init'
        false
      expect(called).toBeTruthy()
        
    it "should raise an error if no next screen exists", ->
      expect(-> simulate doc, (sim) -> true).not.toThrow("Cannot step forward: screen 'init' is a dead end!")
        
    it "should raise an error jumping to nonexistent screens", ->
      expect(-> simulate doc, (sim) -> sim.goto "missing").toThrow("Screen 'missing' not found!")
