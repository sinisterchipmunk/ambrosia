fs            = require 'fs'
path          = require 'path'
{extend}      = require './src/helpers'
{spawn, exec} = require 'child_process'

run = (cb, cmd, args...) ->
  proc =         spawn cmd, args
  proc.stderr.on 'data', (buffer) -> process.stdout.write buffer.toString()
  proc.stdout.on 'data', (buffer) -> process.stdout.write buffer.toString()
  proc.on        'exit', (status) ->
    process.exit(1) if status != 0
    cb() if typeof cb is 'function'


task 'build', 'build the Ambrosia language from source', build = (cb) ->
  run cb, 'coffee', '-c', '-o', 'lib/assets/javascripts', 'src'

task 'build:parser', 'rebuild the Jison parser (run build first)', build_parser = (cb) ->
  extend global, require('util')
  require 'jison'
  parser = require('./lib/assets/javascripts/grammar').parser
  fs.writeFile 'lib/assets/javascripts/parser.js', parser.generate()
  cb() if typeof(cb) is 'function'

task 'test', 'run the ambrosia tests',  ->
  build -> build_parser -> run null, 'script/test'
