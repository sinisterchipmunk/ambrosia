require '../spec_helper'

describe "display", ->
  doc = sim = null
  
  it "should display a view", ->
    doc = dom 'display "../spec/fixtures/views/without-embedded"'
    display = doc.first('screen', id: '__main__').first 'display'
    
    # validate the view was constructed properly (e.g. tags are in order, text appears as expected, etc.)
    str = display.toString()
    # console.log str
    expect(/one\s*<h1/.test str).toBeTruthy()
    expect(/<h1\s+class=['"]title["']>/.test str).toBeTruthy()
    expect(/class=["']title['"]>\s*title caption\s*<\/h1>/.test str).toBeTruthy()
    expect(/\/h1>\s*this is test content/.test str).toBeTruthy()

  it "should embed variable reference values into output", ->
    doc = dom 'a = "value of a"\ndisplay "../spec/fixtures/views/basic-embedded-variable"'
    sim = simulate doc
    sim.start()
    expect(sim.state.display).toContain "value of a"
    
  it "should embed operations into output", ->
    doc = dom 'a = 1\ndisplay "../spec/fixtures/views/basic-embedded-operation"'
    sim = simulate doc
    sim.start()
    expect(sim.state.display).toContain "3"
