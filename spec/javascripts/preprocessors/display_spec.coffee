require 'spec_helper'

describe "display", ->
  doc = sim = null
  
  it "should take a string with xml tags as template content, not filename", ->
    doc = dom 'display "<a>b</a>"'
    expect(doc.toString()).toMatch /<display>[\s\n\t]*<a>/m
  
  it "should take a multiline string as template content, not filename", ->
    doc = dom 'display """\na\nb"""'
    expect(doc.toString()).toMatch /<display>[\s\n\t]*a[\s\n\t]+b[\s\n\t]*<\/display>/m
    
  it "should take a vanilla string as template content, not filename", ->
    doc = dom 'display "test"'
    expect(doc.toString()).toMatch /test/

  it "should extend the screen if it already has a display", ->
    doc = dom '''
    a = 1; display "one"
    a = 2; display "two"
    '''
    # console.log doc.toString()
    sim = simulate doc
    sim.start()
    expect(sim.state.display.trim()).toEqual 'one'
    sim.press 'enter'
    expect(sim.state.display.trim()).toEqual 'two'

  describe "with layout", ->
    it "should yield to layout", ->
      doc = dom '''
      title = "this is a title"
      layout "views/basic-layout"
      display "displaying some text"
      '''
      # console.log doc.toString()
      sim = simulate doc
      sim.start()
      expect(sim.state.display).toMatch /displaying some text/
      expect(sim.state.display).toContain "this is a title"
  