require './spec_helper'

{CLI} = require 'cli'

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
    