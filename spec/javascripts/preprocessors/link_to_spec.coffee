require 'spec_helper'

describe 'link_to', ->
  it "should construct a link", ->
    doc = dom "one:\nshow_view 'views/link_to_one'"
    # console.log doc.toString()
    sim = simulate doc
    sim.start()
    expect(sim.state.display).toMatch /a href="\#one"/
    expect(sim.state.display).toMatch />[\s\n\t]*one[\s\n\t]*<\/a>/
    
  it "should work with closures", ->
    doc = dom "a = 0\none = -> a = 1\ndisplay '<%= link_to \"Caption\", one %>'"
    # console.log doc.toString()
    sim = simulate doc
    sim.start()
    sim.follow "Caption"
    expect(sim.state.variables.a.value).toEqual(1)
