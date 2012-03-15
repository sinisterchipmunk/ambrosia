require 'spec_helper'

describe "display", ->
  doc = sim = null
  
  it "should print to the receipt", ->
    sim = simulate dom "print '\\nhi there'"
    sim.start()
    expect(sim.state.print).toMatch /hi there/
    