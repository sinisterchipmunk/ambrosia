require 'spec_helper'

describe "closures", ->
  doc = null
  
  it "should pass closures as arguments without variable assignment", ->
    doc = dom """
      a = 0
      call_closure(closure): closure()
      call_closure -> a = 1
    """
    # console.log doc.toString()
    sim = simulate doc
    sim.start()
    expect(sim.state.variables.a.value).toEqual 1

  describe "another test, which should be no different...", ->
    sim = simulate dom """
      say_hello = () ->
        return "Hello, World!"
      
      say_hello_to = (name) ->
        return "Hello, " + name
      
      one = say_hello()
      two = say_hello_to "Colin"
    """
    
    it "should set one to 'Hello, World!'", ->
      sim.start()
      expect(sim.state.variables.one.value).toEqual 'Hello, World!'
      
    it "should set two to 'Hello, Colin'", ->
      sim.start()
      expect(sim.state.variables.two.value).toEqual 'Hello, Colin'

  describe "without arguments", ->
    beforeEach -> 
      doc = dom "one = 0\na = -> one = 1\na()"
    
    it "should set one to 1", ->
      sim = simulate doc, (sim) -> not /__main___/.test sim.state.screen.id
      expect(sim.state.variables.one.value).toEqual 1

  describe "with arguments", ->
    beforeEach -> 
      doc = dom "one = 0\na = (p) -> one = p\na 2"
      # console.log doc.toString()

    it "should set one to 2", ->
      sim = simulate doc, (sim) -> not /__main___/.test sim.state.screen.id
      expect(sim.state.variables.one.value).toEqual 2

  describe "with empty arguments", ->
    beforeEach -> 
      doc = dom "one = 0\na = () -> one = 1\na()"

    it "should set one to 1", ->
      # console.log doc.toString()
      sim = simulate doc, (sim) -> not /__main___/.test sim.state.screen.id
      # console.log sim.state.variables
      expect(sim.state.variables.one.value).toEqual 1
