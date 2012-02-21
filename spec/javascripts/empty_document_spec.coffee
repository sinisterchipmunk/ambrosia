require 'spec_helper'

describe "an empty document", ->
  doc = null
  
  beforeEach -> doc = dom("")
  
  it "should go to embedded app on cancel", ->
    expect(doc.first('head').first('defaults').attrs['cancel']).toEqual("emb://embedded.tml")

  it "should default to cache deny", ->
    expect(doc.attrs['cache']).toEqual('deny')
  
  it "should default to namespace 'http://www.ingenico.co.uk/tml'", ->
    expect(doc.attrs['xmlns']).toEqual('http://www.ingenico.co.uk/tml')
