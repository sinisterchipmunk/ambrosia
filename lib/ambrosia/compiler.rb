require 'execjs'
require 'sprockets'

module Ambrosia::Compiler
  EngineError      = ExecJS::RuntimeError
  CompilationError = ExecJS::ProgramError
  
  include Ambrosia::Validation

  module Source
    class << self
      def content
        render 'ambrosia'
      end
    
      def context
        # FIXME it would be better to memoize this but we can't right now because
        # views are compiled as part of the original source. We have to pull
        # views outside of the compile phase before we can memoize the context.
        @context = ExecJS.compile(content)
      end

      def render(path, base_path = @base_path || File.expand_path("../assets/javascripts", File.dirname(__FILE__)))
        av = ActionView::Base.new(base_path)
        av.extend self
        av.render :template => path, :handlers => [:erb], :formats => [:js]
      end

      def ambrosia_build_env
        @ambrosia_env ||= begin
          env = Sprockets::Environment.new
          env.append_path File.expand_path("../assets/javascripts/ambrosia/src", File.dirname(__FILE__))
          env.append_path File.expand_path("../../vendor/assets/javascripts", File.dirname(__FILE__))
          env
        end
      end

      def stdlib_env
        @stdlib_env ||= begin
          env = Sprockets::Environment.new
          env.append_path File.expand_path("../assets/tml", File.dirname(__FILE__))
          env
        end
      end
      
      def view_env
        @view_env ||= begin
          env = Sprockets::Environment.new
          paths = Rails.application.paths['ambrosia/views'].existent_directories
          Rails::Engine.subclasses.each { |engine| paths += engine.paths['ambrosia/views'].existent_directories }
          paths.each { |path| env.append_path path }
          env
        end
      end
    end
    
    delegate :ambrosia_build_env, :stdlib_env, :view_env, :to => '::Ambrosia::Compiler::Source'
  end
  
  def compile(script)
    tml_code = Source.context.call "Ambrosia.compile_to_string", script
    validate tml_code
  end
end
