require 'spec_helper'
{Format} = require 'simulator/formatters'

describe "formatters:", ->
  describe "string", ->
    it "should pull only a single character", ->
      result = new Format('string', 'c', 'one').process()
      expect(result).toEqual('o')
    