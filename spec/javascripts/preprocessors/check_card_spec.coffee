require 'spec_helper'

describe "check_card", ->
  it "should fill in card scheme for correct pans", ->
    sim = simulate dom "card.pan = '5454545454545454'; check_card()"
    sim.start()
    expect(sim.state.variables['card.scheme'].value).toEqual 'MASTERCARD'
    
  it "should complain if pan does not match one on file", ->
    sim = simulate dom "card.pan = '54'; check_card()"
    expect(-> sim.start()).toThrow("Card PAN does not match any registered card data")
    
  it "should set card.parser.verdict to online", ->
    sim = simulate dom "card.pan = '5454545454545454'; check_card()"
    sim.start()
    expect(sim.state.variables['card.parser.verdict'].value).toEqual 'online'
    
  it "should not choke on card sipes", ->
    sim = simulate dom "read_card('mag'); check_card()"
    sim.start()
    sim.swipe_card 'visa'
    expect(sim.state.variables['card.parser.verdict'].value).toEqual 'online'
    