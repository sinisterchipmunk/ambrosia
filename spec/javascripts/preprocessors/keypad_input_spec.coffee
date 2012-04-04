require 'spec_helper'

describe "keypad input", ->
  doc = sim = null
  
  it "should process cancel buttons", ->
    doc = dom """
      result = 0
      closure = ->
        read_card 'magnetic'
        switch ch = getch '1 2 3 4 5 6 7 8 9 0 cancel'
          when 'cancel' then return result = 2
          when '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
            result = 1
            display "0", "1", "2"
        display '3'
      closure()
    """
    # console.log doc.toString()
    sim = simulate doc
    sim.start()
    sim.press "cancel"
    # console.log sim.state.flow[sim.state.flow.length-1]
    expect(sim.state.variables.result.value).toEqual 2
    expect(sim.state.display.trim()).toEqual ""
    
  it "should not treat cardswipe as keypress '0'", ->
    doc = dom """
      result = 0
      closure = ->
        read_card 'magnetic'
        switch ch = getch '1 2 3 4 5 6 7 8 9 0 cancel'
          when 'cancel' then return
          when '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
            result = 1
            display "0", "1", "2"
        display '3'
      closure()
    """
    # console.log doc.toString()
    sim = simulate doc
    sim.start()
    sim.swipe_card "visa"
    expect(sim.state.variables.result.value).toEqual 0
    expect(sim.state.display.trim()).toEqual "3"

  describe "with a display", ->
    beforeEach ->
      doc = dom """
      a = 1
      show_view 'views/basic-embedded-variable'
      b = getch('1')
      """
      # console.log doc.toString()
      sim = simulate doc
      sim.start()
    
    it "should set b to 1", ->
      sim.press '1'
      expect(sim.state.variables.b.value).toEqual '1'
  
  describe "with default key set", ->
    beforeEach ->
      doc = dom "a = getch()"
      sim = simulate doc
      sim.start()
    
    it "should set a to 1", ->
      # console.log doc.toString()
      sim.press '1'
      expect(sim.state.variables.a.value).toEqual '1'
    
    it "should set a to 2", ->
      sim.press '2'
      expect(sim.state.variables.a.value).toEqual '2'
    
  describe 'with custom key set', ->
    beforeEach ->
      doc = dom "a = getch('2')"
      sim = simulate doc
      sim.start()
    
    it "should set a to 1", ->
      # console.log doc.toString()
      sim.press '1'
      expect(sim.state.variables.a.value).not.toEqual '1'
    
    it "should set a to 2", ->
      sim.press '2'
      expect(sim.state.variables.a.value).toEqual '2'
