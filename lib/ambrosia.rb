require 'ambrosia/engine'
require 'ambrosia/template_handler'

module Ambrosia
  autoload :Compiler,     'ambrosia/compiler'
  autoload :TestCase,     'ambrosia/test_case'
  autoload :Template,     'ambrosia/template'
  autoload :Version,      'ambrosia/version'
  autoload :VERSION,      'ambrosia/version'
  
  extend Ambrosia::Compiler
end
