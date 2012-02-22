{Base} = require 'nodes/base'
{Identifier} = require 'nodes/identifier'

exports.PropertyAccess = class PropertyAccess extends Base
  to_code: -> "#{@source.to_code()}.#{@property_name.to_code()}"
  
  children: -> ['source', 'property_name']
  
  type: -> @result().type()
  
  result: ->
    self = this
    fail = ->
      source_name = self.source.__proto__.constructor.name
      property_name = self.property_name.__proto__.constructor.name
      throw new Error "Don't know what to do with PropertyAccess(#{source_name}, #{property_name})"
      
    if @source instanceof Identifier
      console.log @source.get_dependent_variable()
    # else
    fail()
  
  compile: (b) ->
    @result().compile b
