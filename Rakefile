begin
  require 'bundler'
  Bundler::GemHelper.install_tasks
  Bundler.setup
rescue LoadError
  puts " *** You don't seem to have Bundler installed. ***"
  puts "     Please run the following command:"
  puts
  puts "       gem install bundler"
  exit
end

require 'rspec/core/rake_task'

namespace :guides do
  # gen doc:js first because we're going to include a direct link to the JS API dox
  task :generate do
    rm_rf "guides/output"
    ENV["WARN_BROKEN_LINKS"] = "1" # authors can't disable this
    ruby "guides/guides.rb"
  end

  desc 'Validate guides, use ONLY=foo to process just "foo.html"'
  task :validate do
    ruby "guides/w3c_validator.rb"
  end

  desc "Publish the guides"
  task :publish => 'guides:generate' do
    require 'rake/contrib/sshpublisher'
    mkdir_p 'pkg'
    `tar -czf pkg/guides.gz guides/output`
    Rake::SshFilePublisher.new("example.com", "~/guides/public", "pkg", "guides.gz").upload
    `ssh example.com 'cd ~/guides/public/ && tar -xvzf guides.gz && cp -rf guides/output/* . && rm -rf guides*'`
  end
end

desc 'Generate guides (for authors), use ONLY=foo to process just "foo.textile"'
task :guides => [ 'guides:generate', 'build:browser' ]

desc "Rebuild all JS files and then run all tests"
task :default => [ 'build:js', 'build:browser', 'test:units', 'test:integrations', 'jasmine:ci' ]

namespace :build do
  desc "Build all javascript files from coffee source"
  task :js do
    exit 1 unless system "cake", "build", "build:parser"
  end
  
  desc "Build sources into a single browser-friendly .js file"
  task :browser do
    require 'ambrosia'
    Ambrosia::TestCase::RailsTestApp.initialize! # needed for the view paths
    Ambrosia.build_source_to 'guides/output/javascripts/ambrosia-browser.js'
    puts "Built to guides/output/javascripts/ambrosia-browser.js"
  end
end

desc "Build everything"
task :build => [ 'build:js', 'build:browser' ]

namespace :test do
  desc "Run ambrosia unit tests"
  task :units do
    exit 1 unless system "cake test"
  end

  desc "Run rails integration tests"
  RSpec::Core::RakeTask.new :integrations
end

begin
  require 'jasmine'
  load 'jasmine/tasks/jasmine.rake'
rescue LoadError
  task :jasmine do
    abort "Jasmine is not available. In order to run jasmine, you must: (sudo) gem install jasmine"
  end
end
