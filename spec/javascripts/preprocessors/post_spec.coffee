require 'spec_helper'

describe "post", ->
  doc = null
  
  it "should create a simulator state containing post information", ->
    doc = dom 'one = 1; post "/path/to/post", one'
    # console.log doc.toString()
    sim = simulate doc
    sim.start()
    expect(sim.state.post).toEqual path: "/path/to/post", one: 1
    
  it "should split display screens", ->
    doc = dom 'display "<h1>a</h1>"; post "/path/to/post"'
    # console.log doc.toString()
    expect(doc.search('display')[0].parent).not.toBe(doc.search('submit')[0].parent)
    
  it "should create a default error handler if none is given", ->
    doc = dom 'one = 1; post "/path/to/post", one'
    # console.log doc.toString()
    sim = simulate doc
    sim.start()
    expect(sim.state.post).not.toBeUndefined() # sanity check, to make sure we're at the submit
    
    # fail the submit
    sim.fail("submit failure")
    expect(sim.state.display).toMatch /Uncaught Error/
    expect(sim.state.display).toMatch /submit failure/
    
  it "should accept a method reference to handle errors", ->
    doc = dom 'handler:\n  display "error"\none = 1\npost "/path", one, :handler'
    # console.log doc.toString()
    sim = simulate doc
    sim.start()
    expect(sim.state.post).not.toBeUndefined() # sanity check, to make sure we're at the submit
    
    # fail the submit
    sim.fail("submit failure")
    expect(sim.state.display.trim()).toEqual "error"
    
  it "should accept a closure to handle errors", ->
    doc = dom 'one = 1\npost "/path", one, -> display "error"'
    # console.log doc.toString()
    sim = simulate doc
    sim.start()
    expect(sim.state.post).not.toBeUndefined() # sanity check, to make sure we're at the submit
    
    # fail the submit
    sim.fail("submit failure")
    expect(sim.state.display.trim()).toEqual "error"
    