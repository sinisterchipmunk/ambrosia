require '../spec_helper'

doc = sim = null

describe ".txn.input_type = 1", ->
  beforeEach ->
    code = ".txn.input_type = 1"
    doc = dom code
    # console.log doc.toString()
    sim = simulate doc
    sim.start()

  it "should set .txn.input_type to 1", ->
    expect(sim.state.variables['txn.input_type'].value).toEqual 1
