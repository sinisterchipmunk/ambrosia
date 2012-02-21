require 'spec_helper'

doc = sim = null

describe "ForIn (indented)", ->
  beforeEach ->
    code = """
    str = "one"
    copy = ""
    i = 0
    for j in str
      i++
      copy += j
    """
    doc = dom code
    sim = simulate doc
    sim.start()
  
  it "should set i to 3", ->
    # console.log doc.toString()
    # console.log sim.state.variables
    expect(sim.state.variables.i.value).toEqual 3
  
  it "should set copy to 'one'", ->
    expect(sim.state.variables.copy.value).toEqual 'one'
