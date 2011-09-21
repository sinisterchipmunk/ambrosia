require './spec_helper'

describe "tml variables", ->
  doc = null
  
  describe "assigned within a screen", ->
    beforeEach -> doc = dom("init:\n\tone = 1")

    describe "the resultant <vardcl> element", ->
      vardec = null
      beforeEach -> vardec = doc.first("vardcl")
      
      it "should be named 'one'", ->
        expect(vardec.attrs['name']).toEqual('one')
      
      it "should have type 'integer'", ->
        expect(vardec.attrs['type']).toEqual('integer')
    
    describe "the resultant <screen> element", ->
      screen = null
      beforeEach -> screen = doc.first("screen")
      
      it "should have a <setvar> element", ->
        expect(screen.first("setvar")).toBeTruthy()
      