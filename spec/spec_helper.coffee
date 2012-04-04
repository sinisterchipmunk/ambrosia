tml = require 'tml'
fs = require 'fs'
lexer = require 'lexer'
builder = require 'builder'
path = require 'path'
child_process = require 'child_process'
  
run = (cmd, args...) ->
  done = false
  errors = ""
  waitsFor -> done
  proc = child_process.spawn cmd, args
  proc.stderr.on 'data', (buffer) -> errors += buffer
  proc.stdout.on 'data', (buffer) -> process.stdout.write buffer.toString()
  proc.on        'exit', (status) ->
    if status != 0
      expect(-> throw new Error "TML validation failed: #{errors}").not.toThrow()
    done = true

global.Builder = builder.Builder

global.fixture = (filename, ext = 'tml') ->
  filename = __dirname + "/fixtures/"+ filename + "." + ext
  fs.readFileSync(filename, "utf-8").trim()

global.dump_tree = (code) ->
  console.log (new lexer.Lexer).tokenize code
  
global.compile = (code) ->
  tml.compile(code).trim()
  
global.parse = (code) -> tml.parse code

global.build = (name, attrs, inner, depth) ->
  new builder.Builder(name, attrs, inner, depth)

# returns the document object model (in the form of `Builder` instances)
# generated by the specified script.
global.dom = (script) ->
  validate parse(script).compileDOM()
  
global.tml_to_dom = (code) ->
  require('dom').build_dom_from code

validation_index = 0
global.validate = (dom, cb) ->
  if child_process
    tmpfile = "tmp/#{validation_index++}.xml"
    fs.writeFileSync tmpfile, dom.toString()
    run "xmllint", "--noout", "--schema", path.join(process.env['AMBROSIA_PATH'], 'lib/tml.xsd'), tmpfile
  dom

global.simulate = (dom, callback) ->
  sim = new tml.Simulator dom
  sim.start callback if callback
  sim

beforeEach ->
  $.reset()
  $.view_paths.push 'spec/fixtures/fixtures'
  require 'helpers/type_helper'
