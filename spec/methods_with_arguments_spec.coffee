require './spec_helper'

doc = null

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
    expect(doc.first("screen", id:"init").first("setvar", name:"init.one").attrs.lo).toEqual "tmlvar:init.a"
    
# variants to test grammar
describe "a single empty method with a single argument, parenthetical", ->
  beforeEach -> 
    doc = dom "init(a):"

  it "should produce a <screen> element with id 'init'", ->
    expect(doc.first "screen", id:'init').toBeTruthy()

describe "a single empty method with two arguments, parenthetical", ->
  beforeEach ->
    doc = dom "init(a,b):"

  it "should produce a <screen> element with id 'init'", ->
    expect(doc.first "screen", id:'init').toBeTruthy()

describe "a single empty method with two arguments, spaced, parenthetical", ->
  beforeEach ->
    doc = dom "init (a, b):"

  it "should produce a <screen> element with id 'init'", ->
    expect(doc.first "screen", id:'init').toBeTruthy()
