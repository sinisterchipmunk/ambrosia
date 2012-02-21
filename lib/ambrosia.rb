require 'ambrosia/engine'
require 'ambrosia/template_handler'

module Ambrosia
  autoload :Compiler,     'ambrosia/compiler'
  autoload :TestCase,     'ambrosia/test_case'
  autoload :Template,     'ambrosia/template'
  autoload :Version,      'ambrosia/version'
  autoload :VERSION,      'ambrosia/version'
  
  extend Ambrosia::Compiler
  
  def self.build_source_to(dest)
    File.open(dest, 'w') { |f| f.print Ambrosia::Template::Source.content }
  end
end
