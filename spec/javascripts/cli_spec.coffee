require 'spec_helper'
fs = require 'fs'
{CLI} = require 'cli'

# don't test CLI within browser... that would be dumb.
unless fs.isMock && fs.isMock()
  describe 'CLI', ->
    beforeEach ->
      spyOn(console, 'log')
  
    describe 'evaluating code', ->
      it "should log the result", ->
        new CLI().exec("return a = 1")
        expect(console.log).toHaveBeenCalledWith(1)

    describe "compiling code", ->
      it "should log the dom", ->
        new CLI().compile_script("return a = 1")
        expect(console.log).toHaveBeenCalledMatching(/<setvar name="a"/)
    
    describe "comping a file", ->
      it "should log the dom", ->
        new CLI().compile('spec/fixtures/fixtures/scripts/functions')
        expect(console.log).toHaveBeenCalledMatching(/<setvar name="result"/)