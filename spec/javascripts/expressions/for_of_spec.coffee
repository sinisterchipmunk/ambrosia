require 'spec_helper'

doc = sim = null

describe "for x of list", ->
  beforeEach ->
    doc = dom '''
    str = ""
    for x of "one;two;three"
      str += x
    '''
    # console.log doc.toString()
    sim = simulate doc
  
  describe "simulated", ->
    beforeEach ->
      sim.start()

    it "should iterate through items of the list", ->
      expect(sim.state.variables.str.value).toEqual 'onetwothree'

  it "should not create deeply nested variables for dependencies", ->
    expect(sim.state.variables['std.list_index.list_index.std.for_in_range.for_in_range.current']).toBeUndefined()
