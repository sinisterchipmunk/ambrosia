# -*- encoding: utf-8 -*-
$:.push File.expand_path("../lib", __FILE__)
require "ambrosia/version"

Gem::Specification.new do |s|
  s.name        = "ambrosia"
  s.version     = Ambrosia::VERSION
  s.platform    = Gem::Platform::RUBY
  s.authors     = ["Colin MacKenzie IV"]
  s.email       = ["sinisterchipmunk@gmail.com"]
  s.homepage    = "http://rubytml.com"
  s.summary     = %q{Scripting language for generating Incendo TML code}
  s.description = s.summary

  s.add_dependency 'rails', ">= 3.2"
  s.add_dependency 'sprockets'
  s.add_dependency 'execjs'
  s.add_dependency 'nokogiri'

  s.add_development_dependency 'RedCloth', '4.2.8'
  s.add_development_dependency 'rack-asset-compiler'
  s.add_development_dependency 'jasmine'
  s.add_development_dependency 'rspec-rails', ">= 2"
  s.add_development_dependency 'coffee-script'

  s.rubyforge_project = "ambrosia"

  # Don't include stuff used to document ambrosia, otherwise the gem will get huge
  useless_files = `git ls-files -- guides/* node_modules/jasmine-node/node_modules/findit/test/symlinks/dir1/dangling-symlink`.split("\n")

  s.files         = `git ls-files`.split("\n") - useless_files
  s.test_files    = `git ls-files -- {test,spec,features}/*`.split("\n") - useless_files
  s.executables   = `git ls-files -- bin/*`.split("\n").map{ |f| File.basename(f) }
  s.require_paths = ["lib"]
end
