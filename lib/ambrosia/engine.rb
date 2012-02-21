require 'rails'
require 'sprockets/railtie'
require 'active_support/railtie'

module Ambrosia
  class Engine < Rails::Engine
    initializer "ambrosia:mimes" do |app|
      Mime::Type.register 'application/tml', :tml
    end
    
    initializer "ambrosia:assets:engines" do |app|
      app.assets.register_engine '.ambrosia', Ambrosia::Template
    end
  end
end
