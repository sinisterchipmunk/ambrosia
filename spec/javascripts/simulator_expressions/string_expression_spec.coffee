require 'spec_helper'
{Expression} = require 'simulator/expression'

describe "string expression:", ->
  describe "plus", ->
    it "should concatenate strings", ->
      result = Expression.evaluate "string", lo: "hello", ro: "world", op: 'plus'
      expect(result).toEqual "helloworld"
  
  describe "minus", ->
    it "should reject string rvalues", ->
      expect(-> Expression.evaluate "string", lo: "hello", ro: "world", op: 'minus').toThrow()
    
    it "should remove characters from right", ->
      result = Expression.evaluate "string", lo: "hello", ro: 1, op: 'minus'
      expect(result).toEqual "hell"
  
    it "should remove characters from right", ->
      result = Expression.evaluate "string", lo: "hello", ro: -1, op: 'minus'
      expect(result).toEqual "ello"
      
  describe "item", -> # return Nth item from list
    it "with negative index", ->
      expect(Expression.evaluate "string", lo: "one;two", op: "item", ro: -1).toEqual ';'
      
    it "with high index", ->
      expect(Expression.evaluate "string", lo: "one;two", op: "item", ro: 2).toEqual ';'

    it "with 0 index", ->
      expect(Expression.evaluate "string", lo: "one;two", op: "item", ro: 0).toEqual 'one'

    it "with 1 index", ->
      expect(Expression.evaluate "string", lo: "one;two", op: "item", ro: 1).toEqual 'two'

  describe "number", -> # return number of items in list
    it "should return list count 0", ->
      expect(Expression.evaluate "string", lo: "", op: "number").toEqual 0
      
    it "should return list count 1", ->
      expect(Expression.evaluate "string", lo: "one", op: "number").toEqual 1

    it "should return list count 2", ->
      expect(Expression.evaluate "string", lo: "one;two", op: "number").toEqual 2

    it "should return list count 1 for single semicolon", ->
      expect(Expression.evaluate "string", lo: ";", op: "number").toEqual 2

  describe "format", ->
    it "should return only a single character", ->
      expect(Expression.evaluate "string", lo: "one", op: "format", ro: "c").toEqual "o"

    it "should return 2 characters", ->
      expect(Expression.evaluate "string", lo: "one", op: "format", ro: "c2").toEqual "on"
      
    it "should return 2 digits", ->
      expect(Expression.evaluate "string", lo: "123", op: "format", ro: "n2").toEqual "12"
      
    it "should return any number of characters but no numbers", ->
      expect(Expression.evaluate "string", lo: "one111", op: "format", ro: "c*").toEqual "one"
    
    it "should return string unmodified", ->
      expect(Expression.evaluate "string", lo: "ABCD", op: "format", ro: "c*").toEqual "ABCD"
    
    it "should mask all characters", ->
      expect(Expression.evaluate "string", lo: "ABCD", op: "format", ro: "c#*").toEqual "****"
      
    it "should return extra characters as dashes", ->
      expect(Expression.evaluate "string", lo: "ABCD", op: "format", ro: "c8").toEqual "ABCD----"
      
    it "should process complicated formats", ->
      expect(Expression.evaluate "string", lo: "ABCD", op: "format", ro: "c2c#2c4c*").toEqual "AB**----"
      
    it "should process digits", ->
      expect(Expression.evaluate "string", lo: "a1b2", op: "format", ro: "c#nc#n").toEqual "*1*2"
      
    it "should process hidden digits", ->
      expect(Expression.evaluate "string", lo: "a1b2", op: "format", ro: "cn#cn#").toEqual "a*b*"
      
    it "should glob numbers", ->
      expect(Expression.evaluate "string", lo: "123456", op: "format", ro: "n*").toEqual "123456"
    
    it "should glob and mask numbers", ->
      expect(Expression.evaluate "string", lo: "123456", op: "format", ro: "n#*").toEqual "******"

    it "should include format-supplied strings", ->
      expect(Expression.evaluate "string", lo: "ABCD", op: "format", ro: "^*0.00c*\\*").toEqual "^*0.00ABCD*"
      