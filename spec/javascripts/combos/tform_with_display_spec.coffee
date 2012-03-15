require 'spec_helper'

describe "tform with display", ->
  doc = sim = null
  beforeEach ->
    doc = dom """
      read_card 'magnetic'
      display "views/without-embedded"
    """
    
  it "should pass validation", ->
    # console.log doc.toString()
    sim = simulate doc
    sim.start()
    sim.swipe_card "visa"
    expect(sim.state.display).toMatch(/this is test content/)
    