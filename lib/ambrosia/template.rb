require 'sprockets'

class Ambrosia::Template < Tilt::Template
  include Ambrosia::Compiler
    
  attr_reader :context

  def self.default_mime_type
    "application/tml"
  end

  def prepare
  end

  def evaluate(scope, locals, &block)
    @context = scope
    compile data
  end
end
