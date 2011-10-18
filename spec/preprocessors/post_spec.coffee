require '../spec_helper'

describe "post", ->
  doc = null
  
  beforeEach ->
    doc = dom 'one = 1; init: post "/path/to/post", one'
    
  it "should add 'one' to the list of getvars", ->
    getvars = doc.first('screen', id:'init').first('submit').all 'getvar'
    getvars = (getvar.attrs.name for getvar in getvars)
    expect(getvars).toInclude 'one'
  