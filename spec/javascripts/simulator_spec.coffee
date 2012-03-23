require 'spec_helper'

describe "Simulator", ->
  doc = sim = null
  beforeEach -> doc = build('tml', xmlns: 'http://www.ingenico.co.uk/tml')
  
  it "should handle text entry", ->
    doc = dom "result = ''\nswitch getch '1'\n  when '1' then result += 'A'\ndisplay '\\n<input type=\"text\" name=\"result\" />'"
    sim = simulate doc
    sim.start()
    sim.enter "1234", false
    expect(sim.state.variables.result.value).toEqual("A234")
    
  it "should handle number entry", ->
    doc = dom "result = 5\nswitch getch '1'\n  when '1' then result += 4\ndisplay '\\n<input type=\"number\" name=\"result\" />'"
    sim = simulate doc
    sim.start()
    sim.enter "1234", false
    expect(sim.state.variables.result.value).toEqual(9234)
    
  it "should raise coherent errors when missing variables", ->
    sim = simulate dom ""
    expect(-> sim.find_variable "what").toThrow "Variable not defined: what"
    
  
  describe "display output", ->
    beforeEach ->
      doc.b 'screen', id: 'first', next: '#second', (b) -> b.b 'display', (b) -> b.b '#text', value: 'text one'
      doc.b 'screen', id: 'second', next: '#first', (b) -> b.b 'display', (b) -> b.b '#text', value: 'text two'
    
    it "should wait at first display screen", ->
      sim = simulate doc
      sim.start()
      expect(sim.state.screen.id).toEqual 'first'
      
    it "should have 'text one' output", ->
      sim = simulate doc
      sim.start()
      expect(sim.state.display).toContain "text one"
    
    it "should not have 'text two' output", ->
      sim = simulate doc
      sim.start()
      expect(sim.state.display).not.toContain "text two"
      
    it "should include variables in output", ->
      doc.b 'vardcl', name: 'a', type: 'string'
      doc.first('screen').b 'setvar', name: 'a', lo: 'value of a'
      doc.first('screen').first('display').b 'getvar', name: 'a'
      sim = simulate doc
      sim.start()
      expect(sim.state.display).toContain "value of a"
      
  
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
        found = (sim.state.screen.id == 'other')
        return !found
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
