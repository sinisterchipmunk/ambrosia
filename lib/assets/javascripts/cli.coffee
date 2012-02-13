fs   = require 'fs'
tml = require './tml'
{Simulator} = require "./simulator"

exports.CLI = class CLI
  exec: (script) ->

    dom = tml.parse(script).compileDOM()
    sim = new Simulator dom
    sim.start()
    console.log sim.state.variables.return.value
    
  compile_script: (script) ->
    console.log tml.compile(script).toString()

  compile: (sources...) ->
    results = tml.compile_files sources...
  
    for filename, dom of results
      if sources.length == 1
        console.log dom.toString()
      else
        if match = /^(.*)\.([^\.]*)$/.exec filename
          filename = match[1]
        filename += ".tml"
        fs.writeFile filename, dom.toString(), (err) ->
          if (err) then throw err
          console.log "(Wrote file #{filename})"
        