require 'spec_helper'

describe 'builtins', ->
  doc = sim = null
  
  it "should not fail to compile when referencing a builtin variable", ->
    expect(-> dom "a = card.pan").not.toThrow()

  it "should properly simulate references to builtins", ->
    doc = dom "a = cfgm.scan.interval"
    # console.log doc.toString()
    sim = simulate doc
    sim.start()
    expect(sim.state.variables.a.value).toEqual 1
    
  it "should handle assignments to builtins", ->
    doc = dom "payment.amount = 3"
    # console.log doc.toString()
    sim = simulate doc
    sim.start()
    expect(sim.state.variables['payment.amount'].value).toEqual 3
    