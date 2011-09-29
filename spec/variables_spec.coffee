require './spec_helper'

describe "tml variables", ->
  doc = null
  
  describe "assigning a screen reference", ->
    beforeEach -> doc = dom "init:\n\tone = :one"
    
    it "should define variable 'one'", ->
      expect(doc.first("vardcl", name: 'one')).toBeTruthy()
    
    it "should set variable value to '#one'", ->
      screen = doc.first("screen", id: "init")
      expect(screen.first("setvar", name: "one").attrs['lo']).toEqual '#one'
  
  describe "chaining variable assignments", ->
    beforeEach -> doc = dom "init:\n\tone = two = three = 0"
    
    it "should define 3 variables", ->
      expect(doc.all("vardcl").length).toEqual 3
      
    it "should have 3 setvars", ->
      screen = doc.first("screen", id: "init")
      expect(screen.all("setvar").length).toEqual 3
      
      # verify order
      all = (s.attrs.name for s in screen.all("setvar"))
      expect(all[0]).toEqual "three"
      expect(all[1]).toEqual "two"
      expect(all[2]).toEqual "one"
      
      expect(screen.first("setvar", name: 'three').attrs.lo.toString()).toEqual '0'
      expect(screen.first("setvar", name: 'two').attrs.lo).toEqual 'tmlvar:three'
      expect(screen.first("setvar", name: 'one').attrs.lo).toEqual 'tmlvar:two'

  describe "assigned within a screen", ->
    beforeEach -> doc = dom "init:\n\tone = 1"
    
    describe "the resultant <vardcl> element", ->
      vardec = null
      beforeEach -> vardec = doc.first "vardcl"
      
      it "should be named 'one'", ->
        expect(vardec.attrs['name']).toEqual 'one'
      
      it "should have type 'integer'", ->
        expect(vardec.attrs['type']).toEqual 'integer'
    
    describe "the resultant <screen> element", ->
      screen = null
      beforeEach -> screen = doc.first "screen", id: "init"
      
      it "should have a <setvar> element", ->
        expect(screen.first("setvar")).toBeTruthy()
