require './spec_helper'

describe "conditions", ->
  doc = sim = null
  
  describe "program flow", ->
    beforeEach ->
      doc = dom """
      one = 0
      init(a): one = a
      if one >= 1 then init 2
      else init 3
      one = one + one
      """
      # console.log doc.toString()
      sim = simulate doc
      
    describe "not setting control", ->
      beforeEach -> 
        sim.start()# -> console.log sim.state.screen.id, sim.state.variables.one.value if sim.state.screen.id != '__shift_char__'; sim.peek() != '#__main__'
    
      it "should process else, then continue", ->
        expect(sim.state.variables['one'].value).toEqual 6
      
    describe "setting control", ->
      beforeEach ->
        sim.state.variables['one'].value = 1
        sim.start()# -> console.log sim.state.screen.id, sim.state.variables.one.value if sim.state.screen.id != '__shift_char__'; sim.peek() != '#__main__'
      
      it "should process if, then continue", ->
        expect(sim.state.variables['one'].value).toEqual 4
###
  describe 'block', ->
    beforeEach -> doc = dom """
      init: one = 2
      
      one = 1
      if one >= 1
        init()
    """
    
    it "should create an appropriate variant", ->
      expect(doc.first('screen', id: "__main__").variants()[0].attrs.lo).toEqual 'tmlvar:one'
      expect(doc.first('screen', id: "__main__").variants()[0].attrs.op).toEqual 'less'
      expect(doc.first('screen', id: "__main__").variants()[0].attrs.ro).toEqual '1'
    
    it "should call init() from variant", ->
      uri = doc.first('screen', id: "__main__").variants()[0].attrs.uri
      expect(doc.first('screen', id: uri[1..-1]).next().attrs.uri).toEqual '#init'
    
  describe 'block else', ->
    beforeEach -> doc = dom """
      init: one = 3

      one = 1
      if one >= 1
        init()
      else
        one = 2
    """

    it "should create an appropriate variant", ->
      # console.log doc.toString()
      expect(doc.first('screen', id: "__main__").variants()[0].attrs.lo).toEqual 'tmlvar:one'
      expect(doc.first('screen', id: "__main__").variants()[0].attrs.op).toEqual 'less'
      expect(doc.first('screen', id: "__main__").variants()[0].attrs.ro).toEqual '1'

    it "should call init() from variant", ->
      uri = doc.first('screen', id: "__main__").variants()[0].attrs.uri
      expect(doc.first('screen', id: uri[1..-1]).next().attrs.uri).toEqual '#init'

    it "should default to the else variant", ->
      target = doc.first('screen', id: '__main__').next().attrs.uri[1..-1]
      expect(target).not.toEqual('__return__')
      expect(target).not.toEqual('__main__')

    it "should set one to 2 from else", ->
      uri = doc.first('screen', id: "__main__").next().attrs.uri
      setvar = doc.first('screen', id: uri[1..-1]).first('setvar')
      expect(setvar.attrs.name).toEqual "one"
      expect(setvar.attrs.lo).toEqual "2"

  describe "single line", ->
    beforeEach -> doc = dom """
      init: one = 3
      one = 1
      if one >= 1 then init()
    """

    it "should create an appropriate variant", ->
      expect(doc.first('screen', id: "__main__").variants()[0].attrs.lo).toEqual 'tmlvar:one'
      expect(doc.first('screen', id: "__main__").variants()[0].attrs.op).toEqual 'less'
      expect(doc.first('screen', id: "__main__").variants()[0].attrs.ro).toEqual '1'

    it "should call init() from variant", ->
      uri = doc.first('screen', id: "__main__").variants()[0].attrs.uri
      expect(doc.first('screen', id: uri[1..-1]).next().attrs.uri).toEqual '#init'

  describe "single line break else", ->
    beforeEach -> doc = dom """
      init: one = 3
      one = 1
      if one >= 1 then init()
      else one = 2
    """

    it "should create an appropriate variant", ->
      expect(doc.first('screen', id: "__main__").variants()[0].attrs.lo).toEqual 'tmlvar:one'
      expect(doc.first('screen', id: "__main__").variants()[0].attrs.op).toEqual 'less'
      expect(doc.first('screen', id: "__main__").variants()[0].attrs.ro).toEqual '1'

    it "should call init() from variant", ->
      uri = doc.first('screen', id: "__main__").variants()[0].attrs.uri
      expect(doc.first('screen', id: uri[1..-1]).next().attrs.uri).toEqual '#init'

    it "should default to the else variant", ->
      target = doc.first('screen', id: '__main__').next().attrs.uri[1..-1]
      expect(target).not.toEqual('__return__')
      expect(target).not.toEqual('__main__')

    it "should set one to 2 from else", ->
      uri = doc.first('screen', id: "__main__").next().attrs.uri
      setvar = doc.first('screen', id: uri[1..-1]).first('setvar')
      expect(setvar.attrs.name).toEqual "one"
      expect(setvar.attrs.lo).toEqual "2"

  describe "single line with else", ->
    beforeEach -> doc = dom """
      init: one = 3
      one = 1
      if one >= 1 then init() else one = 2
    """

    it "should create an appropriate variant", ->
      expect(doc.first('screen', id: "__main__").variants()[0].attrs.lo).toEqual 'tmlvar:one'
      expect(doc.first('screen', id: "__main__").variants()[0].attrs.op).toEqual 'less'
      expect(doc.first('screen', id: "__main__").variants()[0].attrs.ro).toEqual '1'

    it "should call init() from variant", ->
      uri = doc.first('screen', id: "__main__").variants()[0].attrs.uri
      expect(doc.first('screen', id: uri[1..-1]).next().attrs.uri).toEqual '#init'

    it "should default to the else variant", ->
      target = doc.first('screen', id: '__main__').next().attrs.uri[1..-1]
      expect(target).not.toEqual('__return__')
      expect(target).not.toEqual('__main__')

    it "should set one to 2 from else", ->
      uri = doc.first('screen', id: "__main__").next().attrs.uri
      setvar = doc.first('screen', id: uri[1..-1]).first('setvar')
      expect(setvar.attrs.name).toEqual "one"
      expect(setvar.attrs.lo).toEqual "2"
