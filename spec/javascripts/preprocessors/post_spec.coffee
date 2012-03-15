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
    console.log doc.toString()
    expect(doc.search('display')[0].parent).not.toBe(doc.search('submit')[0].parent)
    