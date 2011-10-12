require '../spec_helper'

doc = sim = null

describe "for x of list", ->
  beforeEach ->
    doc = dom 'str = ""\nfor x of "one;two;three"\n\tstr += x'
    console.log doc.toString()
    sim = simulate doc, (sim) ->
      console.log sim.state.screen.id, sim.state.variables
      if sim.state.screen.id == '__shift_last__' and sim.state.variables['call.stack'].value == ''
        return false
      true
  
  xit "should iterate through items of the list", ->
    expect(sim.state.variables.str.value).toEqual 'onetwothree'
