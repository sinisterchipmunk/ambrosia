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
      beforeEach -> screen = doc.first "screen"
      
      it "should have a <setvar> element", ->
        expect(screen.first("setvar")).toBeTruthy()
