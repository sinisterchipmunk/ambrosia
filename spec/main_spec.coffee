require './spec_helper'

describe 'main', ->
  doc = null
  beforeEach -> doc = dom """
    main:
      one = 1
      two = 2
  """
  
  it "should create vardcls", ->
    expect(doc.first("vardcl", name: 'one')).toBeTruthy()
    expect(doc.first("vardcl", name: 'two')).toBeTruthy()
  
  it "should set one = 1", ->
    expect(doc.first("screen", id: "main").first("setvar", name: 'one').attrs['lo']).toEqual '1'
    
  it "should set two = 2", ->
    expect(doc.first("screen", id: "main").first("setvar", name: 'two').attrs['lo']).toEqual '2'
    