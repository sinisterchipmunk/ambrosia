require 'spec_helper'

describe "ambrosia with sprockets" do
  it "should serve ambrosia-tml files" do
    get '/assets/test.tml'
    response.body.should =~ /xmlns="http:\/\/www.ingenico.co.uk\/tml"/
  end
end