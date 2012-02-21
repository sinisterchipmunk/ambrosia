require './spec_helper'
{MethodCall, Identifier} = require 'nodes'

describe "param list", ->
  meth = null
  beforeEach ->
    meth = new MethodCall new Identifier("method"), [new Identifier("parm1"), new Identifier("parm2")]
  
  it "should assign parent to each item in list", ->
    expect(meth.params[0].parent).toBe meth
    expect(meth.params[1].parent).toBe meth
    