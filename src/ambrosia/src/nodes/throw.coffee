{Extension} = require 'nodes/extension'

exports.Throw = class Throw extends Extension
  children: -> ['expression']
  
  to_code: -> "throw #{@expression.to_code()}"
  
  compile: (b) ->
    @import b, 'std/throw'
    @invoke b, 'throw_error', @expression
    