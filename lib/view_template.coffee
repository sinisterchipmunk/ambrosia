exports.ViewTemplate = class ViewTemplate
  constructor: (@content) ->
    
  process: (context, builder) ->
    return @content
