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

task :default => :test

namespace :build do
  desc "Build all javascript files from coffee source"
  task :js do
    exit 1 unless system "cake", "build"
    exit 1 unless system "cake", "build:parser"
  end
  
  desc "Build sources into a single browser-friendly .js file"
  task :browser do
    require 'sprockets'
    $sprockets_env = Sprockets::Environment.new
    $sprockets_env.append_path 'lib/assets/javascripts'
    $sprockets_env.append_path 'lib/assets/tml'
    File.open('guides/output/javascripts/ambrosia-browser.js', 'w') { |f| f.print $sprockets_env['browser.js'] }
    puts "Built to guides/output/javascripts/ambrosia-browser.js"
  end
  
  desc "Build everything"
  task :all => [ 'build:js', 'build:browser' ]
end

desc "Run all tests"
task :test => "build:js" do
  exit 1 unless exec "script/test"
end

begin
  require 'jasmine'
  load 'jasmine/tasks/jasmine.rake'
rescue LoadError
  task :jasmine do
    abort "Jasmine is not available. In order to run jasmine, you must: (sudo) gem install jasmine"
  end
end
