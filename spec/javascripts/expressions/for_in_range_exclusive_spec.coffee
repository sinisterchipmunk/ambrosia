require 'spec_helper'

doc = sim = null

describe "for x in [0...3]", ->
  beforeEach ->
    code = """
    str = ""
    i = 0
    for j in [0...3]
      i++
      str += j
    """
    doc = dom code
    # console.log doc.toString()
    sim = simulate doc
    sim.start()

  it "should set i to 3", ->
    expect(sim.state.variables.i.value).toEqual 3

  it "should set str to '012'", ->
    expect(sim.state.variables.str.value).toEqual '012'
