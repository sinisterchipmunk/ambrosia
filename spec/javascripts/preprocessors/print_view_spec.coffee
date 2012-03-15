require 'spec_helper'

describe "print view", ->
  doc = sim = null
  
  it "should print to the receipt", ->
    sim = simulate dom "print_view 'views/without-embedded'"
    sim.start()
    expect(sim.state.print).toMatch /this is test content/
