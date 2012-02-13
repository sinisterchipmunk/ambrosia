path = require 'path'

class PreprocessorVariables
  constructor: -> @defaults()
  
  reset: ->
    for k, v of this
      delete this[k] unless v instanceof Function
    @defaults()
    
  defaults: ->
    @ambrosia_path = __dirname
    @ambrosia_stdlib_path = process.env['AMBROSIA_STDLIB_PATH'] || path.join(__dirname, '../ambrosia')
    @view_paths or= (=>
      paths = [
        path.join process.cwd(), 'views'
        path.join @ambrosia_stdlib_path, "std/views"
      ]
      paths.unshift p if p = process.env['AMBROSIA_VIEW_PATH']
      paths
    )()

exports.$ = new PreprocessorVariables
