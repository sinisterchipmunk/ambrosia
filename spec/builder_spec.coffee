require './spec_helper'

describe "Builder", ->
  builder = null
  
  beforeEach -> builder = build('tml')
  
  it "multiple siblings should not be joined by commas", ->
    builder.b 'screen', id: 1
    builder.b 'screen', id: 2
    expect(builder.toString()).not.toMatch(/,/)
  
  it "should default root to itself", ->
    expect(builder.root).toBe(builder)
    
  it "should return newly-built nodes", ->
    expect(builder.b 'screen').toBeInstanceOf(Builder)
  
  it "should insert preamble by default", ->
    expect(builder.toString()).toEqual("<?xml version=\"1.0\" encoding=\"ISO-8859-1\"?>\n<tml />")

  it "should build root tag with children", ->
    expect(builder.toString(false)).toEqual('<tml />')

  it "should build root tag with children", ->
    builder.b 'screen'
    expect(builder.toString(false)).toEqual("<tml>\n  <screen />\n</tml>")
    
  it "should change attributes on root tag", ->
    builder.attrs['one'] = 1
    expect(builder.toString(false)).toEqual('<tml one="1" />')
    
  it "should set attributes on children", ->
    builder.b 'screen', id: 'idle'
    expect(builder.toString(false)).toEqual("<tml>\n  <screen id=\"idle\" />\n</tml>")
  
  it "should build children with attributes with callbacks", ->
    builder.b 'screen', id: 'idle', (b) -> b.b 'display'
    expect(builder.toString(false)).toEqual('<tml>\n  <screen id="idle">\n    <display />\n  </screen>\n</tml>')
    
  it "should build children without attributes with callbacks", ->
    builder.b 'screen', (b) -> b.b 'display'
    expect(builder.toString(false)).toEqual('<tml>\n  <screen>\n    <display />\n  </screen>\n</tml>')

  it "should return first element matching +name+", ->
    builder.b 'screen', id: 'one'
    builder.b 'screen', id: 'two'
    
    expect(builder.first('screen').attrs.id).toEqual('one')

  it "should return first element matching `name` AND `attrs` if given", ->
    builder.b 'screen', id: 'one'
    builder.b 'screen', id: 'two'
    
    expect(builder.first('screen', id: 'two').attrs.id).toEqual('two')
    
  it "should return all elements", ->
    builder.b 'screen', id: 'one'
    builder.b 'screen', id: 'two'
    builder.b 'vardcl', name: 'three'
    
    expect(builder.all().length).toEqual 3
    
  it "should return all elements matching `name`", ->
    builder.b 'screen', id: 'one'
    builder.b 'screen', id: 'two'
    builder.b 'vardcl', name: 'three'
    
    expect(builder.all('screen').length).toEqual 2
    
  it "should return all elements matching `name` AND `attrs` if given", ->
    builder.b 'screen', id: 'one', name: 'other'
    builder.b 'screen', id: 'two', name: 'other'
    builder.b 'screen', id: 'three', name: 'another'
    
    expect(builder.all('screen', name: 'other').length).toEqual 2

  it "should set parent on children and grandchildren", ->
    builder.b 'screen', (b) -> b.b 'next'
    expect(builder.first('screen').parent).toBe(builder)
    expect(builder.first('screen').first('next').parent).toBe(builder.first('screen'))
  
  it "should set root on children and grandchildren", ->
    builder.b 'screen', (b) -> b.b 'next'
    expect(builder.first('screen').root).toBe(builder)
    expect(builder.first('screen').first('next').root).toBe(builder)
    