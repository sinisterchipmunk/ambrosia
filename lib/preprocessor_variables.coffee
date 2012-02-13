path = require 'path'

class PreprocessorVariables
  constructor: -> @defaults()
  
  reset: ->
    for k, v of this
      delete this[k] unless v instanceof Function
    @defaults()
    
  defaults: ->
    @view_paths or= (->
      paths = [
        path.join process.cwd(), 'views'
        path.join __dirname, "std/views"
      ]
      paths.unshift p if p = process.env['AMBROSIA_VIEW_PATH']
      paths
    )()

exports.$ = new PreprocessorVariables
