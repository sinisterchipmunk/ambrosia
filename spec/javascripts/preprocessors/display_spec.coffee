require 'spec_helper'

describe "display", ->
  doc = sim = null
  
  it "should take a string with xml tags as template content, not filename", ->
    doc = dom 'display "<a>b</a>"'
    expect(doc.toString()).toMatch /<display>[\s\n\t]*<a>/m
  
  it "should take a multiline string as template content, not filename", ->
    doc = dom 'display """\na\nb"""'
    expect(doc.toString()).toMatch /<display>[\s\n\t]*a[\s\n\t]+b[\s\n\t]*<\/display>/m
  
  it "should raise a coherent error if the view is not found", ->
    expect(->
      doc = dom '$.view_paths = ["over/the/rainbow"]\ndisplay "somewhere"'
    ).toThrow('Could not find view "somewhere" in view paths ["over/the/rainbow"]')
  
  it "should display a relative view in the view path", ->
    doc = dom '$.view_paths = ["spec/fixtures/fixtures/views"]\ndisplay "without-embedded"'
    expect(doc.toString()).toMatch(/this is test content/)
    
  it "should display multiple views", ->
    doc = dom '$.view_paths = ["spec/fixtures/fixtures/views"]\ndisplay "without-embedded", "link_to_one"'
    expect(doc.toString()).toMatch(/<a href="#one"/)
    expect(doc.toString()).toMatch(/this is test content/)
  
  it "should display a view", ->
    doc = dom 'display "views/without-embedded"'

    # validate the view was constructed properly (e.g. tags are in order, text appears as expected, etc.)
    str = doc.toString()
    # console.log str
    expect(/one\s*<h1/.test str).toBeTruthy()
    expect(/<h1\s+class=['"]title["']>/.test str).toBeTruthy()
    expect(/class=["']title['"]>\s*title caption\s*<\/h1>/.test str).toBeTruthy()
    expect(/\/h1>\s*this is test content/.test str).toBeTruthy()

  it "should embed variable reference values into output", ->
    doc = dom 'a = "value of a"\ndisplay "views/basic-embedded-variable"'
    sim = simulate doc
    sim.start()
    expect(sim.state.display).toContain "value of a"
    
  it "should embed operations into output", ->
    doc = dom 'a = 1\ndisplay "views/basic-embedded-operation"'
    sim = simulate doc
    sim.start()
    expect(sim.state.display).toContain "3"
    
  it "should run code but not embed it", ->
    doc = dom 'a = 1\ndisplay "views/basic-embedded-code"'
    # console.log doc.toString()
    sim = simulate doc
    sim.start()
    expect(sim.state.variables.a.value).toEqual 2
    
  it "should extend the screen if it already has a display", ->
    doc = dom '''
    a = 1; display "views/basic-embedded-variable"
    a = 2; display "views/basic-embedded-variable"
    '''
    # console.log doc.toString()
    sim = simulate doc
    sim.start()
    expect(sim.state.display.trim()).toEqual '1'
    sim.press 'enter'
    expect(sim.state.display.trim()).toEqual '2'

  describe "with layout", ->
    it "should yield to layout", ->
      doc = dom '''
      a = 1
      title = "this is a title"
      layout "views/basic-layout"
      display "views/basic-embedded-operation"
      '''
      # console.log doc.toString()
      sim = simulate doc
      sim.start()
      expect(sim.state.display).toMatch /the result is[\s\t\n]+3/
      expect(sim.state.display).toContain "this is a title"
  