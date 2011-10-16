require '../spec_helper'

doc = sim = null

describe "for x in [0..3]", ->
  beforeEach ->
    code = """
    str = ""
    i = 0
    for j in [0..3]
      i++
      str += j
    """
    doc = dom code
    # console.log doc.toString()
    count = 500
    sim = simulate doc, (sim) ->
      # if sim.state.screen.id == '_closure_3_merge_6'
      # console.log sim.state.screen.id, sim.state.variables['i'].value, sim.state.variables['std.for_in_range.for_in_range.current'].value, sim.state.variables['std.for_in_range.for_in_range.stop'].value
      if sim.state.screen.id == '__shift_last__' and sim.state.variables['call.stack'].value == ''
        return false
      --count > 0
      
  it "should set i to 4", ->
    # console.log doc.toString()
    # console.log sim.state.variables
    expect(sim.state.variables.i.value).toEqual 4
  
  it "should set str to '0123'", ->
    expect(sim.state.variables.str.value).toEqual '0123'

