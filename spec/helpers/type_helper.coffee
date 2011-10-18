beforeEach ->
  this.addMatchers
    toBeInstanceOf: (expected) ->
      this.actual instanceof expected

    toInclude: (expected) ->
      this.actual.indexOf(expected) != -1