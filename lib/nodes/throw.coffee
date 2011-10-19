{Extension} = require './extension'

exports.Throw = class Throw extends Extension
  children: -> ['expression']
  
  to_code: -> "throw #{@expression.to_code()}"
  
  compile: (b) ->
    @require b, 'std/throw'
    @invoke b, 'throw_error', @expression
    