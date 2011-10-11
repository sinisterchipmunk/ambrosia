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
    beforeEach -> doc = dom 'list = "one;two"; one = list[0]'
    
    it "should set one to list item 0", ->
      expect(doc.first('screen', id: "__main__").first("setvar", name: "one").attrs.lo).toEqual "tmlvar:list"
      expect(doc.first('screen', id: "__main__").first("setvar", name: "one").attrs.op).toEqual "item"
      expect(doc.first('screen', id: "__main__").first("setvar", name: "one").attrs.ro).toEqual "0"
      
  describe "parentheticals", ->
    beforeEach -> doc = dom 'one = 1 + (2 + 3)'
    
    it "should declare an additional variable", ->
      expect(doc.all('vardcl').length).toBeGreaterThan(dom('one = 2').all('vardcl').length)
    
    it "should store the parenthetical in a temporary assign", ->
      setvar = doc.first('screen', id: '__main__').first('setvar')
      expect(setvar.attrs.name).not.toEqual 'one'
      expect(setvar.attrs.lo).toEqual '2'
      expect(setvar.attrs.ro).toEqual '3'
      expect(setvar.attrs.op).toEqual 'plus'
    
    it "should set right operand to a string starting with tmlvar:", ->
      expect(doc.first('screen').first('setvar', name:'one').attrs.ro).toMatch(/^tmlvar:/)
    