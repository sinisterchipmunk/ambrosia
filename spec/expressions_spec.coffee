require './spec_helper'

describe "expressions", ->
  describe "parentheticals", ->
    doc = null
    beforeEach -> doc = dom 'one = 1 + (2 + 3)'
    
    it "should store the parenthetical in a temporary assign", ->
      console.log doc.toString()
      setvar = doc.first('screen', id: '__main__').first('setvar')
      expect(setvar.attrs.name).not.toEqual 'one'
      expect(setvar.attrs.lo).toEqual '2'
      expect(setvar.attrs.ro).toEqual '3'
      expect(setvar.attrs.op).toEqual 'plus'
    