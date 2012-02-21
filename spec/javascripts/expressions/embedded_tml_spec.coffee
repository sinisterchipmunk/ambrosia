require '../spec_helper'

describe 'embedded tml', ->
  doc = sim = null
  
  beforeEach ->
    doc = dom """
    varname = 0
    `
    <setvar name='varname' lo='1' op='plus' ro='1' />
    <display>
      <h1>Title</h1>
      Body text
    </display>
    `
    """
    sim = simulate doc
    sim.start()
  
  it "should be waiting for input", ->
    expect(sim.is_waiting_for_input()).toBeTruthy()
  
  it "should display title", ->
    expect(sim.state.display).toMatch /<h1>\s*Title\s*<\/h1>/m

  it "should display body text", ->
    expect(sim.state.display).toMatch /Body text/
