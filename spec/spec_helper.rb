$:.unshift File.expand_path('../lib', File.dirname(__FILE__))
require 'ambrosia'
require 'rspec/rails'

FileUtils.rm_rf File.expand_path('../tmp/cache', File.dirname(__FILE__))

RSpec.configure do |c|
end
