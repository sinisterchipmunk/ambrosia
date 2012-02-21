require './spec_helper'

describe "Builder", ->
  builder = null
  
  beforeEach -> builder = build('tml')
  
  describe "removal", ->
    beforeEach ->
      builder.b 'one'
    
    it "should remove 'one'", ->
      builder.remove 'one'
      expect(builder.all('one').length).toEqual 0

    it "should remove the node", ->
      builder.remove builder.first('one')
      expect(builder.all('one').length).toEqual 0

  describe "insertion", ->
    beforeEach ->
      builder.b 'one'
      builder.b 'one'
      builder.b 'two'
      builder.b 'two'
      
    it "with attrs but missing inner", ->
      builder.insert 'three', {}, after: 'four'
      expect(builder.tags[4].name).toEqual('three')
      
    describe "with missing target", ->
      it "(before)", ->
        builder.insert 'three', before: 'four'
        tags = (tag.name for tag in builder.tags)
        expect(tags[0]).toEqual 'one'
        expect(tags[1]).toEqual 'one'
        expect(tags[2]).toEqual 'two'
        expect(tags[3]).toEqual 'two'
        expect(tags[4]).toEqual 'three'
      
      it "(after)", ->
        builder.insert 'three', after: 'four'
        tags = (tag.name for tag in builder.tags)
        expect(tags[0]).toEqual 'one'
        expect(tags[1]).toEqual 'one'
        expect(tags[2]).toEqual 'two'
        expect(tags[3]).toEqual 'two'
        expect(tags[4]).toEqual 'three'
  
    describe "with existing target", ->
      it "(before)", ->
        builder.insert 'three', before: 'two'
        tags = (tag.name for tag in builder.tags)
        expect(tags[0]).toEqual 'one'
        expect(tags[1]).toEqual 'one'
        expect(tags[2]).toEqual 'three'
        expect(tags[3]).toEqual 'two'
        expect(tags[4]).toEqual 'two'
      
      it "(after)", ->
        builder.insert 'three', after: 'one'
        tags = (tag.name for tag in builder.tags)
        expect(tags[0]).toEqual 'one'
        expect(tags[1]).toEqual 'one'
        expect(tags[2]).toEqual 'three'
        expect(tags[3]).toEqual 'two'
        expect(tags[4]).toEqual 'two'
  
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
    