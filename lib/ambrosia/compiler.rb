require 'execjs'
require 'sprockets'
# require 'action_view/base'

module Ambrosia::Compiler
  EngineError      = ExecJS::RuntimeError
  CompilationError = ExecJS::ProgramError

  module Source
    class << self
      def content
        render 'browser'
      end
    
      def context
        @context ||= ExecJS.compile(content)
      end

      def render(path, base_path = @base_path || File.expand_path("../assets/javascripts", File.dirname(__FILE__)))
        av = ActionView::Base.new(base_path)
        av.extend self
        av.render :template => path, :handlers => [:erb], :formats => [:js]
      end
    end

    def sprockets_env
      @sprockets_env ||= begin
        sprockets_env = Sprockets::Environment.new
        sprockets_env.append_path File.expand_path("../assets/javascripts", File.dirname(__FILE__))
        sprockets_env
      end
    end
  
    def view_env
      @view_env ||= begin
        view_env = Sprockets::Environment.new
        view_env.append_path File.expand_path("../assets/tml", File.dirname(__FILE__))
        view_env
      end
    end
  end
  
  def compile(script)
    Source.context.call "Ambrosia.compile_to_string", script
  end
end
