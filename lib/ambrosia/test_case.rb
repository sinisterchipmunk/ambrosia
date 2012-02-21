require 'action_controller/railtie'

module Ambrosia::TestCase
  class RailsTestApp < Rails::Application
    config.assets.version = '1'
    config.active_support.deprecation = :log
    config.root = File.expand_path('../../tmp/spec-rails-root', File.dirname(__FILE__))
    config.secret_token = "12345" * 10
    config.action_dispatch.show_exceptions = false
    config.assets.enabled = true
    
    def self.initialized?
      @initialized
    end unless respond_to?(:initialized?)
  end
  
  def app_path(relative_path)
    RailsTestApp.root.join relative_path
  end
  
  def create_file(filename, contents = nil)
    app_path(filename).tap do |full_path|
      FileUtils.mkdir_p File.dirname(full_path)
      File.open full_path, "w" do |f|
        f.print contents if contents
        yield f if block_given?
      end
    end
  end
  
  def create_directory(path)
    full_path = app_path(path)
    FileUtils.mkdir_p full_path
    full_path
  end
  
  def setup
    RailsTestApp.initialize! unless RailsTestApp.initialized?
    reset_app_files!
    bump_assets! # don't allow cached assets to taint other tests
  end
  
  def bump_assets!
    RailsTestApp.config.assets.version = (RailsTestApp.config.assets.version.to_i + 1).to_s
  end
  
  def reset_app_files!
    FileUtils.rm_rf app_path('app')
    FileUtils.rm_rf app_path('lib')
    FileUtils.rm_rf app_path('vendor')
  end
end
