require 'execjs'

module Ambrosia::Compiler
  EngineError      = ExecJS::RuntimeError
  CompilationError = ExecJS::ProgramError

  module Source
    def self.content
      @content ||= begin
        source = File.read(File.expand_path("../assets/javascripts/browser.js.erb", File.dirname(__FILE__)))
        sprockets_env = Sprockets::Environment.new
        sprockets_env.append_path File.expand_path("../assets/javascripts", File.dirname(__FILE__))
        ERB.new(source).result binding
      end
    end
    
    def self.context
      @context ||= ExecJS.compile(content)
    end
  end
  
  def compile(script)
    Source.context.call "Ambrosia.compile_to_string", script
  end
end
