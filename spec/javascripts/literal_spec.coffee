require './spec_helper'
{Literal} = require 'nodes/literal'

describe "Literals", ->
  describe "array", ->
    lit = null
    beforeEach -> lit = new Literal([1, 2])
    
    it "should recognize array type", ->
      expect(lit.type()).toEqual 'string'
      
    it "should produce a string list", ->
      expect(lit.compile()).toEqual '1;2'
      