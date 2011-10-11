require './spec_helper'

describe "warnings", ->
  doc = sim = null
  
  describe "unaltered", ->
    beforeEach ->
      spyOn console, 'log'
      doc = dom 'str = ""\ni = 0\nfor j in [0..3]\n\ti++\n\tstr += j'
    
    it "should dump warning to stdout", ->
      expect(console.log).toHaveBeenCalledWith('Warning: integer variable str conflicts with a string variable of the same name')

  describe "made fatal", ->
    it "should raise warning as error", ->
      expect(-> dom 'raise_warnings()\nstr = ""\ni = 0\nfor j in [0..3]\n\ti++\n\tstr += j').toThrow(
        'integer variable str conflicts with a string variable of the same name'
      )
  
  describe "silenced fatal", ->
    beforeEach ->
      spyOn console, 'log'
      doc = dom 'silence_warnings()\nstr = ""\ni = 0\nfor j in [0..3]\n\ti++\n\tstr += j'
    
    it "should not dump warning to stdout", ->
      expect(console.log).not.toHaveBeenCalledWith('Warning: integer variable str conflicts with a string variable of the same name')
