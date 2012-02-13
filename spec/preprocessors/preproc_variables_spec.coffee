require '../spec_helper'

describe "preprocessor ($) variables", ->
  doc = sim = null
  
  it "should should assign variable values", ->
    doc = dom '$.view_paths = ["../spec/fixtures/views"]'
    expect($.view_paths).toEqual(['../spec/fixtures/views'])

  it "should set view paths by default", ->
    expect($.view_paths).not.toEqual(['../spec/fixtures/views'])
    