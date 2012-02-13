describe "read_card", ->
  describe "magnetic", ->
    doc = dom "read_card 'magnetic'"
    # console.log doc.toString()
    sim = simulate doc
    sim.start()
  
    it "should set txn.type to 1", ->
      # txn.type 1 represents mag swipe
      # txn.type 2 represents read ICC EMV
      # txn.type 3 represents manual entry
      expect(sim.state.variables['txn.type'].value).toEqual 1
    
    it "should be waiting for user input", ->
      expect(sim.is_waiting_for_input()).toBeTruthy()

    xit "should populate card fields after swipe", ->
