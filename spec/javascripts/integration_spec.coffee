fs = require 'fs'

describe "complete scripts", ->
  doc = null
  beforeEach -> 
    doc = dom fs.readFileSync "./spec/fixtures/scripts/functions", 'UTF-8'
    # console.log doc.toString()

  it "should set all variables as expected", ->
    # first iteration is when sim is started; second is when sim returns
    iterations = 2
    sim = simulate doc, (sim) ->
      iterations -= 1 if sim.state.screen.id == '__main__'
      return iterations > 0
      
    # init(a, b, c):
    #   one = a             #=> 1
    #   two = b             #=> 2
    #   return second c     #=> second(3) => 4
    # 
    # second(a):
    #   one = a             #=> 3
    #   return one + 1      #=> 3+1 => 4
    # 
    # result = init 1, 2, 3 #=> 4
    
    expect(sim.state.variables['init.a'].value).toEqual 1
    expect(sim.state.variables['init.b'].value).toEqual 2
    expect(sim.state.variables['init.c'].value).toEqual 3
    expect(sim.state.variables['init.one'].value).toEqual 1
    expect(sim.state.variables['init.two'].value).toEqual 2
    expect(sim.state.variables['second.a'].value).toEqual 3
    expect(sim.state.variables['second.one'].value).toEqual 3
    expect(sim.state.variables['result'].value).toEqual 4
    # console.log sim.state.variables
  