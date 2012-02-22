require 'rails'
require 'rails/engine'
require 'sprockets/railtie'
require 'active_support/railtie'

# we add ambrosia paths to Rails::Engine so that everything that inherits from it
# (including the app itself) can produce tml. Otherwise we'd have to hack in to the
# application in an un-pretty way.
module Rails
  class Engine < Rails::Railtie
    initializer "ambrosia:paths" do |app|
      paths.add 'ambrosia/views', :with => 'app/assets/tml/views'
      paths['ambrosia/views'] << 'lib/assets/tml/views'
      paths['ambrosia/views'] << 'vendor/assets/tml/views'
    end
  end
end

module Ambrosia
  class Engine < Rails::Engine

    initializer "ambrosia:mimes" do |app|
      Mime::Type.register 'text/tml', :tml
    end
    
    initializer "ambrosia:assets:engines" do |app|
      app.assets.register_engine '.ambrosia', Ambrosia::Template
    end
  end
end
