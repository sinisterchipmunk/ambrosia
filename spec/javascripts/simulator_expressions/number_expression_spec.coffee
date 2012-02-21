require 'spec_helper'
{Expression} = require 'simulator/expression'

describe "number expression", ->
  it "addition", ->
    result = Expression.evaluate "integer", lo: 1, ro: 2, op: 'plus'
    expect(result).toEqual 3
  
  it "subtraction", ->
    result = Expression.evaluate "integer", lo: 1, ro: 2, op: 'minus'
    expect(result).toEqual -1
