require 'bundler/setup'
d = Ambrosia::Template::Source.context
d.send(:compile_to_tempfile, "#{d.instance_variable_get("@source")}\nconsole.log('root')") do |f|
  File.open('t.js', 'w') { |k| k.print File.read(f.path) }
end
