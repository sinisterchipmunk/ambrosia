require 'spec_helper'

describe "warnings", ->
  doc = sim = null
  
  describe "unaltered", ->
    beforeEach ->
      spyOn console, 'log'
      doc = dom 'i = 0\ni = ""'
    
    it "should dump warning to stdout", ->
      expect(console.log).toHaveBeenCalledWith('Warning: string variable i conflicts with a integer variable of the same name')

  describe "made into errors", ->
    it "should raise warning as error", ->
      expect(-> dom 'raise_warnings()\ni = 0\ni = ""').toThrow(
        'string variable i conflicts with a integer variable of the same name'
      )
  
  describe "silenced fatal", ->
    beforeEach ->
      spyOn console, 'log'
      doc = dom 'silence_warnings()\ni = 0\ni = ""'
    
    it "should not dump warning to stdout", ->
      expect(console.log).not.toHaveBeenCalledWith('Warning: string variable i conflicts with a integer variable of the same name')
