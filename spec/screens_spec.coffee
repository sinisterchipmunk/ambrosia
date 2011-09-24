require './spec_helper'

###
A "tml block" is identical to a TML screen. A "screen" is a misnomer because a logical "screen"
may not correlate to a single message as displayed on the physical terminal screen. For instance,
consider a "screen" that checks whether a debit or credit card was swiped; if it was debit, a
cashback screen should be displayed. If credit, the cashback screen should be skipped. Technically,
this logic happens under an invisible <screen> element that the terminal never actually displays.
This is confusing to beginners. The concept of a "block" is much easier to understand: it's a chunk
of code, end of story.
###

describe "tml blocks", ->
  doc = null
  
  describe "a single tml screen", ->
    beforeEach -> doc = dom("init:")

    it "should produce a <screen> element with id 'init'", ->
      expect(doc.first("screen", id:'init')).toBeTruthy()
      
  describe "a one-line screen", ->
    beforeEach -> doc = dom("init: something = 1")
    
    it "should set something to 1", ->
      simulate doc, (sim) ->
        expect(sim.state.variables.something.value).toEqual(1)
  
  # describe "a function call from init", ->
  #   beforeEach -> doc = dom("init: result = other\nother: return 1")
  # 
  #   it "should produce 2 screens", ->
  #     expect(doc.all("screen").length).toEqual 2
  #   
  #   it "should produce a 'return.other' variable", ->
  #     expect(doc.first("vardcl", name: 'return.other')).toBeTruthy()
  #     
  #   describe "the init screen", ->
  #     # beforeEach -> debugger = debug(doc.first("screen", id: "init"))
  #     
  #     