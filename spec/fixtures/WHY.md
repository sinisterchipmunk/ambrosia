We nest some files in fixtures/fixtures instead of fixtures/ because the jasmine config
at spec/javascripts/support/jasmine_config.rb points ambrosia to fixtures/ as a load path,
but doing this will break the specs when they run because they're expecting the fixtures
to be found at a fixtures/ subpath, and the load path prefixes are removed from all paths
when the source file is generated.
