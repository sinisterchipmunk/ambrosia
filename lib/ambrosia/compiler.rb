require 'execjs'
require 'sprockets'
# require 'action_view/base'

module Ambrosia::Compiler
  EngineError      = ExecJS::RuntimeError
  CompilationError = ExecJS::ProgramError

  module Source
    class << self
      def content
        render 'ambrosia'
      end
    
      def context
        @context ||= ExecJS.compile(content)
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
    end
    
    delegate :ambrosia_build_env, :stdlib_env, :to => '::Ambrosia::Compiler::Source'
  end
  
  def compile(script)
    Source.context.call "Ambrosia.compile_to_string", script
  end
end
