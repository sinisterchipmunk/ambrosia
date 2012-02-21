require 'spec_helper'
{Expression} = require 'simulator/expression'

# boolean expressions are unique in that they are only evaluated by <variant> tags.
describe "boolean expressions:", ->
  describe 'equal with format', ->
    it "true", ->
      result = Expression.evaluate "boolean", lo: "one", ro: "o", op: "equal", format: "c"
      expect(result).toEqual true
    
    it "false", ->
      result = Expression.evaluate "boolean", lo: "one", ro: "n", op: "equal", format: "c"
      expect(result).toEqual false
  
  describe "contains", ->
    it "true", ->
      result = Expression.evaluate "boolean", lo: "onetwoone", ro: "two", op: 'contains'
      expect(result).toEqual true

    it "false", ->
      result = Expression.evaluate "boolean", lo: "oneone", ro: "two", op: 'contains'
      expect(result).toEqual false
  
    it "variables true", ->
      result = Expression.evaluate "boolean", {lo: "tmlvar:one", ro: "tmlvar:two", op: 'contains'}, one:{value:"onetwoone",type:'string'}, two: {value:"two",type:'string'}
      expect(result).toEqual true
  
    it "variables false", ->
      result = Expression.evaluate "boolean", {lo: "tmlvar:one", ro: "tmlvar:two", op: 'contains'}, one:{value:"oneone",type:'string'}, two: {value:"two",type:'string'}
      expect(result).toEqual false

  describe "equal", ->
    it "true", ->
      result = Expression.evaluate "boolean", lo: 1, ro: 1, op: 'equal'
      expect(result).toEqual true

    it "false", ->
      result = Expression.evaluate "boolean", lo: 1, ro: 2, op: 'equal'
      expect(result).toEqual false
  
    it "variables true", ->
      result = Expression.evaluate "boolean", {lo: "tmlvar:one", ro: "tmlvar:two", op: 'equal'}, one:{value:1,type:'integer'}, two: {value:1,type:'integer'}
      expect(result).toEqual true
  
    it "variables false", ->
      result = Expression.evaluate "boolean", {lo: "tmlvar:one", ro: "tmlvar:two", op: 'equal'}, one:{value:1,type:'integer'}, two: {value:2,type:'integer'}
      expect(result).toEqual false

  describe "not_equal", ->
    it "true", ->
      result = Expression.evaluate "boolean", lo: 1, ro: 1, op: 'not_equal'
      expect(result).toEqual false

    it "false", ->
      result = Expression.evaluate "boolean", lo: 1, ro: 2, op: 'not_equal'
      expect(result).toEqual true

    it "variables true", ->
      result = Expression.evaluate "boolean", {lo: "tmlvar:one", ro: "tmlvar:two", op: 'not_equal'}, one:{value:1,type:'integer'}, two: {value:1,type:'integer'}
      expect(result).toEqual false

    it "variables false", ->
      result = Expression.evaluate "boolean", {lo: "tmlvar:one", ro: "tmlvar:two", op: 'not_equal'}, one:{value:1,type:'integer'}, two: {value:2,type:'integer'}
      expect(result).toEqual true

  describe "less", ->
    it "true", ->
      result = Expression.evaluate "boolean", lo: 1, ro: 1, op: 'less'
      expect(result).toEqual false

    it "false", ->
      result = Expression.evaluate "boolean", lo: 1, ro: 2, op: 'less'
      expect(result).toEqual true

    it "variables true", ->
      result = Expression.evaluate "boolean", {lo: "tmlvar:one", ro: "tmlvar:two", op: 'less'}, one:{value:1,type:'integer'}, two: {value:1,type:'integer'}
      expect(result).toEqual false

    it "variables false", ->
      result = Expression.evaluate "boolean", {lo: "tmlvar:one", ro: "tmlvar:two", op: 'less'}, one:{value:1,type:'integer'}, two: {value:2,type:'integer'}
      expect(result).toEqual true

  describe "less_or_equal", ->
    it "true less", ->
      result = Expression.evaluate "boolean", lo: 1, ro: 1, op: 'less_or_equal'
      expect(result).toEqual true

    it "true equal", ->
      result = Expression.evaluate "boolean", lo: 1, ro: 2, op: 'less_or_equal'
      expect(result).toEqual true
      
    it "false", ->
      result = Expression.evaluate "boolean", lo: 3, ro: 2, op: 'less_or_equal'
      expect(result).toEqual false
      
    it "variables true less", ->
      result = Expression.evaluate "boolean", {lo: "tmlvar:one", ro: "tmlvar:two", op: 'less_or_equal'}, one:{value:1,type:'integer'}, two: {value:1,type:'integer'}
      expect(result).toEqual true

    it "variables true equal", ->
      result = Expression.evaluate "boolean", {lo: "tmlvar:one", ro: "tmlvar:two", op: 'less_or_equal'}, one:{value:1,type:'integer'}, two: {value:2,type:'integer'}
      expect(result).toEqual true

    it "variables false", ->
      result = Expression.evaluate "boolean", {lo: "tmlvar:one", ro: "tmlvar:two", op: 'less_or_equal'}, one:{value:3,type:'integer'}, two: {value:2,type:'integer'}
      expect(result).toEqual false

