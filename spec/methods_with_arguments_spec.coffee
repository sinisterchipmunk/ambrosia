require './spec_helper'

doc = sim = null

describe "with a list argument", ->
  beforeEach ->
    doc = dom """
    _a = _b = _c = ""
    init(a, b, c):
      _a = a
      _b = b
      _c = c
    init "one;two;three", "four", "five"
    """

    sim = simulate doc, (sim) ->
      if sim.state.screen.id == '__shift_last__' and sim.state.variables['call.stack'].value == ''
        return false
      true

  it "should not confuse list elements for arguments", ->
    expect(sim.state.variables['_a'].value).toEqual "one;two;three"
    expect(sim.state.variables['_b'].value).toEqual "four"
    expect(sim.state.variables['_c'].value).toEqual "five"

describe "an unused method", ->
  beforeEach ->
    doc = dom "init(a, b):"
  
  it "should produce a string init.a", ->
    expect(doc.first("vardcl", name: "init.a").attrs.type).toEqual 'string'
    
  it "should produce a string init.b", ->
    expect(doc.first("vardcl", name: "init.b").attrs.type).toEqual 'string'
    

describe "calling a single empty method with a single argument", ->
  beforeEach -> 
    doc = dom "init(a):\nmain: init 1"

  it "should produce a <screen> element with id 'init'", ->
    expect(doc.first "screen", id:'init').toBeTruthy()

  it "should produce a variable 'init.a'", ->
    expect(doc.first('vardcl', name:'init.a').attrs.type).toEqual 'integer'
    
describe "a method which sets variable to value of argument", ->
  beforeEach -> doc = dom "init(a): one = a\nmain: init 1"
  
  it "should set 'one' to 'a'", ->
    expect(doc.search("setvar", name:"init.one")[0].attrs.lo).toEqual "tmlvar:init.a"
    
# variants to test grammar
describe "a single empty method with a single argument, parenthetical", ->
  beforeEach -> 
    doc = dom "init(1); init(a):"

  it "should produce a <screen> element with id 'init'", ->
    expect(doc.first "screen", id:'init').toBeTruthy()

describe "a single empty method with two arguments, parenthetical", ->
  beforeEach ->
    doc = dom "init(1,2); init(a,b):"

  it "should produce a <screen> element with id 'init'", ->
    expect(doc.first "screen", id:'init').toBeTruthy()
