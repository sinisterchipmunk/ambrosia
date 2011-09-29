require '../spec_helper'
{Expression} = require 'simulator/expression'

describe "generic expression", ->
  it "without variable reference", ->
    result = Expression.evaluate "integer", lo: 1, ro: 2, op: 'plus'
    expect(result).toEqual 3
  
  it "with variable reference", ->
    result = Expression.evaluate "integer", {lo:'tmlvar:a', ro: 2, op: 'plus'}, {a: {value: 10, type:'integer'}}
    expect(result).toEqual 12
