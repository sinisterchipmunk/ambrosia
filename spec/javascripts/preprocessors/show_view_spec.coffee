require 'spec_helper'

describe "show_view", ->
  doc = sim = null
  
  it "should not raise an error given an empty view", ->
    expect(-> doc = dom 'show_view "views/empty"').not.toThrow()
  
  it "should raise a coherent error if the view is not found", ->
    expect(->
      doc = dom '$.view_paths = ["over/the/rainbow"]\nshow_view "somewhere"'
    ).toThrow('Could not find view "somewhere" in view paths ["over/the/rainbow"]')
  
  it "should show_view a relative view in the view path", ->
    doc = dom '$.view_paths = ["spec/fixtures/fixtures/views"]\nshow_view "without-embedded"'
    expect(doc.toString()).toMatch(/this is test content/)
    
  it "should show_view multiple views", ->
    doc = dom '$.view_paths = ["spec/fixtures/fixtures/views"]\nshow_view "without-embedded", "link_to_one"'
    expect(doc.toString()).toMatch(/<a href="#one"/)
    expect(doc.toString()).toMatch(/this is test content/)
  
  it "should show_view a view", ->
    doc = dom 'show_view "views/without-embedded"'

    # validate the view was constructed properly (e.g. tags are in order, text appears as expected, etc.)
    str = doc.toString()
    # console.log str
    expect(/one\s*<h1/.test str).toBeTruthy()
    expect(/<h1\s+class=['"]title["']>/.test str).toBeTruthy()
    expect(/class=["']title['"]>\s*title caption\s*<\/h1>/.test str).toBeTruthy()
    expect(/\/h1>\s*this is test content/.test str).toBeTruthy()

  it "should embed variable reference values into output", ->
    doc = dom 'a = "value of a"\nshow_view "views/basic-embedded-variable"'
    sim = simulate doc
    sim.start()
    expect(sim.state.display).toContain "value of a"
    
  it "should embed operations into output", ->
    doc = dom 'a = 1\nshow_view "views/basic-embedded-operation"'
    sim = simulate doc
    sim.start()
    expect(sim.state.display).toContain "3"
    
  it "should run code but not embed it", ->
    doc = dom 'a = 1\nshow_view "views/basic-embedded-code"'
    # console.log doc.toString()
    sim = simulate doc
    sim.start()
    expect(sim.state.variables.a.value).toEqual 2
    
  it "should extend the screen if it already has a show_view", ->
    doc = dom '''
    a = 1; show_view "views/basic-embedded-variable"
    a = 2; show_view "views/basic-embedded-variable"
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
      show_view "views/basic-embedded-operation"
      '''
      # console.log doc.toString()
      sim = simulate doc
      sim.start()
      expect(sim.state.display).toMatch /the result is[\s\t\n]+3/
      expect(sim.state.display).toContain "this is a title"
