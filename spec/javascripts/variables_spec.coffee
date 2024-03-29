require 'spec_helper'

describe "variables", ->
  doc = sim = null
  
  describe "assigning to a variable", ->
    beforeEach ->
      doc = dom "init:\n\tone = 1\n\ttwo = one\ninit()"
      
    it "should assign by variable reference", ->
      expect(doc.first("screen", id:"init").first("setvar", name:"init.two").attrs.lo).toEqual 'tmlvar:init.one'
  
  describe "assigning to expression result", ->
    beforeEach ->
      doc = dom "init:\n\tone = 1 + 1\ninit()"
      sim = simulate doc
      sim.start()
    
    it "should set 'one' to correct value", ->
      expect(sim.state.variables['init.one'].value).toEqual 2
  
  describe "assigning a screen reference", ->
    beforeEach -> doc = dom "init:\n\tone = :one\ninit()"
    
    it "should define variable 'one'", ->
      expect(doc.first("vardcl", name: 'init.one')).toBeTruthy()
    
    it "should set variable value to '#one'", ->
      screen = doc.first("screen", id: "init")
      expect(screen.first("setvar", name: "init.one").attrs['lo']).toEqual '#one'
  
  describe "chaining variable assignments", ->
    beforeEach -> doc = dom "init:\n\tone = two = three = 0\ninit()"
    
    it "should define all 3 variables", ->
      expect(doc.first "vardcl", name: "init.three").toBeTruthy()
      expect(doc.first "vardcl", name: "init.two"  ).toBeTruthy()
      expect(doc.first "vardcl", name: "init.one"  ).toBeTruthy()
      
    it "should have 3 setvars", ->
      screen = doc.first("screen", id: "init")
      expect(screen.all("setvar").length).toEqual 3
      
      # verify order
      all = (s.attrs.name for s in screen.all("setvar"))
      expect(all[0]).toEqual "init.three"
      expect(all[1]).toEqual "init.two"
      expect(all[2]).toEqual "init.one"
      
      expect(screen.first("setvar", name: 'init.three').attrs.lo.toString()).toEqual '0'
      expect(screen.first("setvar", name: 'init.two').attrs.lo).toEqual 'tmlvar:init.three'
      expect(screen.first("setvar", name: 'init.one').attrs.lo).toEqual 'tmlvar:init.two'

  describe "assigned within a screen", ->
    beforeEach -> doc = dom "init:\n\tone = 1\ninit()"
    
    describe "the resultant <vardcl> element", ->
      vardec = null
      beforeEach -> vardec = doc.last "vardcl", name: 'init.one'
      
      it "should be named 'init.one'", ->
        expect(vardec).toBeTruthy()
      
      it "should have type 'integer'", ->
        expect(vardec.attrs['type']).toEqual 'integer'
    
    describe "the resultant <screen> element", ->
      screen = null
      beforeEach -> screen = doc.first "screen", id: "init"
      
      it "should have a <setvar> element", ->
        expect(screen.first("setvar")).toBeTruthy()
