require 'rack/coffee_compiler'
require 'ambrosia'

module Jasmine
  class Config
    alias_method :old_js_files, :js_files

    def js_files(spec_filter = nil)
      Ambrosia.build_source_to 'guides/output/javascripts/ambrosia-browser.js'
      generate_fixtures
      
      # Convert all .coffee files into .js files before putting them in a script tag
      old_js_files(spec_filter).map do |filename|
        filename.sub(/\.coffee/, '.js')
      end
    end
    
    def generate_fixtures
      path = File.expand_path("../../fixtures/fixtures.js", File.dirname(__FILE__))
      File.open(path, 'w') do |f|
        env = Sprockets::Environment.new
        env.append_path File.expand_path('../../fixtures/fixtures', File.dirname(__FILE__))
        env.append_path File.expand_path('../../fixtures/fixtures', File.dirname(__FILE__))
        f.print ERB.new(File.read("#{path}.erb")).result(binding)
      end
    end

    def start_server(port=8888)
      # We can't access the RAILS_ROOT constant from here
      root = File.expand_path(File.join(File.dirname(__FILE__), '../../..'))

      config = self

      app = Rack::Builder.new do
        # Compiler for your specs
        use Rack::CoffeeCompiler,
            :source_dir => File.join(root, 'spec'),
            :url => config.spec_path

        # Compiler for your app files
        # use Rack::CoffeeCompiler,
        #     :source_dir => File.join(root, 'src'),
        #     :url => '/public/javascripts'
        
        run Jasmine.app(config)
      end

      server = Rack::Server.new(:Port => port, :AccessLog => [])
      # workaround for Rack bug, when Rack > 1.2.1 is released Rack::Server.start(:app => Jasmine.app(self)) will work
      server.instance_variable_set(:@app, app)
      server.start
    end
  end
end
