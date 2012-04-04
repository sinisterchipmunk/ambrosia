require 'spec_helper'

# These specs aren't necessarily intuitive, but they describe how
# the terminal behaves, and therefore they describe how the simulator
# should behave.

describe "Simulator", ->
  doc = sim = null
  beforeEach -> doc = build('tml', xmlns: 'http://www.ingenico.co.uk/tml')
  
  it "should raise an error when 'cancel' is listed as a key variant", ->
    doc = dom ""
    scr = doc.first 'screen'
    scr.b 'next', uri: '#__main__', (n) -> n.b 'variant', uri: "#__main__", key: 'cancel'
    expect(-> simulate(doc).start()).toThrow "'cancel' is not allowed as a variant key"
