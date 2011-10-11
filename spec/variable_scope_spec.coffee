# describes low level code in adding variables and functions to, and retrieving them from,
# the current scope.

Scope = require('variable_scope').VariableScope
nodes = require('nodes')
require './spec_helper'

Identifier = (name) -> new nodes.Identifier name
# MethodCall = (name) -> new nodes.MethodCall Identifier(name), []

describe "scope", ->
  scope = oldFunc = null

  beforeEach ->
    scope = new Scope
    # mock up nodes' current_scope for testing against
    oldFunc = nodes.Base.prototype.current_scope
    nodes.Base.prototype.current_scope = -> scope

  afterEach ->
    nodes.Base.prototype.current_scope = oldFunc
  
  # describe "method", ->
  #   beforeEach -> scope.define 'calcAtten', 'integer', true
  #   
  #   it "should find method from MethodCall node", ->
  #     expect(MethodCall("calcAtten").type()).toEqual 'integer'
      
  describe "local variable", ->
    beforeEach -> scope.define 'ambient', 'integer'
    
    it "should lookup variable by name", ->
      expect(-> scope.lookup "ambient").not.toThrow()
      
    it "should find variable from Identifier node", ->
      expect(Identifier('ambient').type()).toEqual 'integer'
      
    describe "lookup descriptor", ->
      desc = null
      beforeEach -> desc = scope.lookup 'ambient', 'integer'

      it "should include type", ->
        expect(desc.type()).toEqual 'integer'
        
      it "should include name", ->
        expect(desc.name).toEqual 'ambient'
        
  describe "variable of different scope", ->
    one = two = null
    
    beforeEach ->
      one = scope.sub 'one'
      two = scope.sub 'two'
      
      one.define 'varname'
      
    describe "a third level of scope", ->
      three = null
      
      beforeEach ->
        three = one.sub 'three'
        three.define 'varname2'
        
      it "should go to root if prefixed with a period", ->
        scope.define("heyo")
        expect(three.lookup(".heyo")).toBeTruthy()
        
      it 'should have prefix one.three', ->
        expect(three.prefix()).toEqual 'one.three.'
      
      it "should find varname in three", ->
        expect(three.lookup("varname2").name).toEqual 'one.three.varname2'
        
      it "should find one.varname", ->
        expect(three.lookup("one.varname").name).toEqual 'one.varname'
  
    it "should resolve qualified name from sibling scope", ->
      expect(two.lookup 'one.varname').toBeTruthy()
      
    it "should not resolve qualified name of missing variable", ->
      expect(-> two.lookup 'one.missing').toThrow "one.missing is not defined"
      
    it "should not resolve local name from sibling scope", ->
      expect(-> two.lookup 'varname').toThrow "two.varname is not defined"
      
    
    