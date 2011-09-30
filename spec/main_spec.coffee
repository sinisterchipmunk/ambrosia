require './spec_helper'

describe 'main', ->
  doc = null
  beforeEach -> doc = dom """
    one = 1
    two = 2
  """
  
  it "should create vardcls", ->
    expect(doc.first("vardcl", name: 'one')).toBeTruthy()
    expect(doc.first("vardcl", name: 'two')).toBeTruthy()
  
  it "should set one = 1", ->
    expect(doc.first("screen", id: "__main__").first("setvar", name: 'one').attrs['lo']).toEqual '1'
    
  it "should set two = 2", ->
    expect(doc.first("screen", id: "__main__").first("setvar", name: 'two').attrs['lo']).toEqual '2'
  
describe "combination of mains", ->
  doc = null
  beforeEach -> doc = dom "one = 1\nmain:\n\ttwo = 2"
  
  it "should create vardcls", ->
    expect(doc.first("vardcl", name: 'one')).toBeTruthy()
    expect(doc.first("vardcl", name: 'main.two')).toBeTruthy()
  
  it "should set one = 1 in __main__", ->
    expect(doc.first("screen", id: "__main__").first("setvar", name: 'one').attrs['lo']).toEqual '1'
    
  it "should set two = 2 in main", ->
    expect(doc.first("screen", id: "main").first("setvar", name: 'main.two').attrs['lo']).toEqual '2'

describe "combination in reverse order", ->
  doc = null
  beforeEach -> doc = dom "main:\n\ttwo = 2\none = 1"
  
  it "should create both methods", ->
    expect(doc.first("screen", id:"__main__")).toBeTruthy()
    expect(doc.first("screen", id:"main")).toBeTruthy()