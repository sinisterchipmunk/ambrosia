{TMLBuilder} = require 'tml_builder'

describe "TMLBuilder", ->
  b = null
  beforeEach -> b = new TMLBuilder()
  
  it "should create a screen", ->
    b.screen '__main__'
    
    expect(b.first('screen', id: '__main__')).toBeTruthy()
    
  describe "with a screen", ->
    beforeEach -> b.screen '__main__'
    
    it "should branch into new screen after calling a method", ->
      b.add_return_screen
      b.screen 'method', next: '#__return__'
      b.current_screen().call_method 'method'
      expect(b.current_screen().attrs.id).not.toEqual('__main__')
      expect(b.current_screen().attrs.id).not.toEqual('method')
    