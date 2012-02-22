require 'spec_helper'

describe "display", ->
  it "should pull in external pages", ->
    doc = dom 'require "path/to/dep"'
    link = doc.first('head').first('link').toString()
    expect(link).toMatch /href="path\/to\/dep"/
  
  it "should default to tml pages if no extension given", ->
    doc = dom 'require "path/to/dep"'
    link = doc.first('head').first('link').toString()
    expect(link).toMatch /rev="text\/tml"/

  it "should autodetect css pages", ->
    doc = dom 'require "path/to/dep.css"'
    link = doc.first('head').first('link').toString()
    expect(link).toMatch /rev="stylesheet"/

  it "should accept rev override", ->
    doc = dom 'require "path/to/dep", "css"'
    link = doc.first('head').first('link').toString()
    expect(link).toMatch /rev="stylesheet"/
    
  it "should accept tml override", ->
    doc = dom 'require "path/to/dep.css", "tml"'
    link = doc.first('head').first('link').toString()
    expect(link).toMatch /rev="text\/tml"/
  