$:.unshift File.expand_path('../lib', File.dirname(__FILE__))
require 'ambrosia'
require 'rspec/rails'

RSpec.configure do |c|
  c.include RSpec::Rails::RequestExampleGroup
  c.include Ambrosia::TestCase
  
  c.before do
    FileUtils.rm_rf File.expand_path('../tmp/cache', File.dirname(__FILE__))
    cleanup
    create_directory 'app/assets/tml'
    draw_routes { match '/tml/test' => 'tml#test' }
    create_file 'app/controllers/tml_controller.rb', 'class TmlController < ActionController::Base; end'
    create_file 'app/views/tml/test.tml.ambrosia', 'a = 1'
    create_file 'app/assets/tml/test.tml.ambrosia', 'a = 1'
    create_file 'app/assets/tml/views/helloworld.xml', 'Hello World'
    create_file 'app/assets/tml/test-with-views.tml.ambrosia', 'display "helloworld"'
    setup
  end
end
