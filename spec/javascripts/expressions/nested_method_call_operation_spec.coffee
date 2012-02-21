require 'spec_helper'

doc = sim = null

describe "for x of list", ->
  beforeEach ->
    doc = dom '''
    l(a): return o(a + 1) + 1
    o(b): return b + 1
    one = l 1
    '''
    # console.log doc.toString()
    sim = simulate doc

  beforeEach ->
    sim.start()
    # console.log sim.state.screen.id, sim.state.variables

  it "should iterate through items of the list", ->
    expect(sim.state.variables.one.value).toEqual 4
