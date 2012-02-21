require 'spec_helper'

describe 'link_to', ->
  it "should construct a link", ->
    doc = dom "one:\ndisplay '../spec/fixtures/views/link_to_one'"
    # console.log doc.toString()
    sim = simulate doc
    sim.start()
    expect(sim.state.display).toMatch /a href="\#one"/
    expect(sim.state.display).toMatch />[\s\n\t]*one[\s\n\t]*<\/a>/
    