fs            = require 'fs'
path          = require 'path'
{extend}      = require './src/helpers'
{spawn, exec} = require 'child_process'

run = (args, cb) ->
  proc =         spawn 'coffee', args
  proc.stderr.on 'data', (buffer) -> console.log buffer.toString()
  proc.on        'exit', (status) ->
    process.exit(1) if status != 0
    cb() if typeof cb is 'function'


task 'build', 'build the CoffeeScript language from source', build = (cb) ->
  files = fs.readdirSync 'src'
  files = ('src/' + file for file in files when file.match(/\.coffee$/))
  # run ['-c', '-o', 'lib/assets/javascripts'].concat(files), cb
  run ['-c', '-o', 'lib/assets/javascripts', 'src'], cb

task 'build:parser', 'rebuild the Jison parser (run build first)', ->
  extend global, require('util')
  require 'jison'
  parser = require('./lib/assets/javascripts/grammar').parser
  fs.writeFile 'lib/assets/javascripts/parser.js', parser.generate()
