require 'spec_helper'

describe "ambrosia with sprockets" do
  include RSpec::Rails::RequestExampleGroup
  include Ambrosia::TestCase
  before { setup }
  
  it "should serve ambrosia-tml files" do
    create_file 'app/assets/tml/test.tml.ambrosia', 'a = 1'
    get '/assets/test.tml'
    response.body.should =~ /xmlns="http:\/\/www.ingenico.co.uk\/tml"/
  end
end
