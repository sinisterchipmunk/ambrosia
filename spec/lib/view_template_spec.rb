require 'spec_helper'

describe "ambrosia view templates" do
  it "should serve ambrosia-tml files" do
    get '/tml/test.tml'
    response.body.should =~ /xmlns="http:\/\/www.ingenico.co.uk\/tml"/
  end
end
