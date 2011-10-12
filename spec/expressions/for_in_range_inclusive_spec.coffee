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
    count = 100
    sim = simulate doc, (sim) ->
      # console.log sim.state.screen.id, sim.state.variables['std.for_in.for_in_range.current'].value, sim.state.variables['std.for_in.for_in_range.stop'].value
      if sim.state.screen.id == '__shift_last__' and sim.state.variables['call.stack'].value == ''
        return false
      --count > 0
      
  it "should set types of start, stop, step to integer", ->
    expect(sim.state.variables['std.for_in.for_in_range.current'].type).toEqual 'integer'
    expect(sim.state.variables['std.for_in.for_in_range.stop'].type).toEqual 'integer'
    expect(sim.state.variables['std.for_in.for_in_range.step'].type).toEqual 'integer'
  
  it "should set i to 4", ->
    # console.log doc.toString()
    # console.log sim.state.variables
    expect(sim.state.variables.i.value).toEqual 4
  
  it "should set str to '0123'", ->
    expect(sim.state.variables.str.value).toEqual '0123'

