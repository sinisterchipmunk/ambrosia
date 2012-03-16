require 'spec_helper'

describe "switch", ->
  doc = sim = null
  
  describe "with multi argument cases", ->
    beforeEach ->
      doc = dom """
      i = j = 0
      closure = ->
        switch i
          when 0, 1 then j = 1
          else j = 3
      closure()
      """
      # console.log doc.toString()
      sim = simulate doc
      
    describe "with i == 0", ->
      it "should set j to 1", ->
        sim.start()
        expect(sim.state.variables.j.value).toEqual 1

    describe "with i == 1", ->
      it "should set j to 1", ->
        sim.step()
        sim.state.variables.i.value = 1
        sim.start()

        expect(sim.state.variables.j.value).toEqual 1

    describe "with i == 2", ->
      it "should set j to 3", ->
        sim.step()
        sim.state.variables.i.value = 2
        sim.start()

        expect(sim.state.variables.j.value).toEqual 3    
  
  describe "with single argument cases", ->
    beforeEach ->
      # the closure is not necessary for the code to work, but it is necessary to allow
      # the simulator to inject values into `i` after the first screen has already been
      # processed.
      doc = dom """
      i = j = 0
      closure = ->
        switch i
          when 0 then j = 1
          when 1
            j = 2
          else j = 3
      closure()
      """
      # console.log doc.toString()
      sim = simulate doc
  
    describe "with i == 0", ->
      it "should set j to 1", ->
        sim.start()
        expect(sim.state.variables.j.value).toEqual 1
      
    describe "with i == 1", ->
      it "should set j to 2", ->
        sim.step()
        sim.state.variables.i.value = 1
        sim.start()
      
        expect(sim.state.variables.j.value).toEqual 2

    describe "with i == 2", ->
      it "should set j to 3", ->
        sim.step()
        sim.state.variables.i.value = 2
        sim.start()

        expect(sim.state.variables.j.value).toEqual 3