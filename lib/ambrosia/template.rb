class Ambrosia::Template < Tilt::Template
  include Ambrosia::Compiler
    
  attr_reader :context

  def self.default_mime_type
    "text/tml"
  end

  def prepare
    
  end

  def evaluate(scope, locals, &block)
    @context = scope
    depend_on_ambrosia
    compile data
  end
  
  def depend_on_ambrosia
    depend_on_env Ambrosia::Compiler::Source.ambrosia_build_env
    depend_on_env Ambrosia::Compiler::Source.stdlib_env
    depend_on_env Ambrosia::Compiler::Source.view_env
  end
  
  def depend_on_env(env)
    env.each_file { |path| @context.depend_on path }
  end
end
