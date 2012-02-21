require 'sprockets'
require 'execjs'

class Ambrosia::Template < Tilt::Template
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
    
  attr_reader :context

  def self.default_mime_type
    "application/tml"
  end

  def prepare
  end

  def evaluate(scope, locals, &block)
    @context = scope
    Source.context.call "Ambrosia.compile_to_string", data
  end
end
