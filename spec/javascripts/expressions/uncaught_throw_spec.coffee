require 'spec_helper'

describe "uncaught throw", ->
  doc = sim = null
  
  beforeEach ->
    doc = dom """
    throw "something bad happened"
    """
    sim = simulate doc
    sim.start()
  
  it "should report the error", ->
    expect(sim.state.display).toMatch /Uncaught Error/
    
  it "should include the error message", ->
    expect(sim.state.display).toMatch /something bad happened/
    