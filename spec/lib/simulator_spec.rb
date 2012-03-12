require 'spec_helper'

describe Ambrosia::Simulator do
  include Ambrosia::Simulator
  
  it "should work" do
    simulate "one = 'VALUE_SET'"
    simulator.state[:variables][:one][:value].should == "VALUE_SET"
  end
  
  it "should follow links" do
    simulate 'display "\n<a href=\'#whatever\'>caption</a>"; whatever: display "\n1"'
    simulator.follow "caption"
    simulator.state[:display].should include("1")
  end
  
  it "should swipe cards" do
    simulate 'read_card "magnetic"'
    simulator.swipe_card "VISA"
    simulator.state[:variables]["card.pan"][:value].should == "4111111111111111"
  end
end
