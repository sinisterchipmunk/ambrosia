beforeEach ->
  this.addMatchers
    toBeInstanceOf: (expected) ->
      this.actual instanceof expected
