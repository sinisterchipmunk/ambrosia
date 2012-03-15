require 'spec_helper'

describe Ambrosia::Simulator do
  include Ambrosia::Simulator
  
  it "should work" do
    simulate "one = 'VALUE_SET'"
    simulator.state[:variables][:one][:value].should == "VALUE_SET"
  end
  
  describe "entering input" do
    it "should raise an error if a keypress goes unacknowledged" do
      simulate "a = 0"
      proc { simulator.enter "1" }.should raise_error("Error: No handler for keypress '1' on this screen")
    end
    
    it "should trigger keypresses" do
      simulate "a = 0\nswitch getch '1'\n  when '1' then a = 1"
      simulator.enter "1", false
      simulator.state[:variables][:a][:value].should == 1
    end
    
    it "should overflow keypresses into fields" do
      simulate "text = ''\nswitch getch '1'\n  when '1' then text += 'A'\ndisplay '\\n<input type=\"text\" name=\"text\" />'"
      simulator.enter "1234", false
      simulator.state[:variables][:text][:value].should == "A234"
    end
    
    it "should press enter upon completion" do
      simulate <<-end_code
text = ''
switch getch '1'
  when '1' then text += 'A'
display '\\none: <input type="text" name="text" />'
display '\\ntwo: <input type="text" name="text" />'
end_code
      simulator.enter "1234"
      simulator.state[:variables][:text][:value].should == "A234"
      simulator.state[:display].should =~ /two:/
    end
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
  
  it "should fill in fields" do
    simulate 'a = 0; display "\n<input type=\'number\' name=\'a\' />"'
    simulator.fill_in 'a', '100'
    simulator.state[:variables][:a][:value].should == 100
  end
  
  it "should perform tml submissions" do
    response = Object.new
    simulator.stub!(:response) { response }
    response.stub!(:body).and_return(compile "a = 2")

    simulator.should_receive(:post).with("/path/to/somewhere", 'a' => 1, 'format' => :tml)
    simulate 'a = 1; post "/path/to/somewhere", a'
  end
  
  it "should process tml responses" do
    response = Object.new
    simulator.stub!(:post)
    simulator.stub!(:response) { response }
    response.stub!(:body).and_return(compile "a = 2")
    
    simulate 'a = 1; post "/path/to/somewhere", a'
    simulator.state[:variables][:a][:value].should == 2
  end
end
