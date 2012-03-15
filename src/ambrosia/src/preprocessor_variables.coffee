path = require 'path'

class PreprocessorVariables
  constructor: -> @defaults()
  
  reset: ->
    for k, v of this
      delete this[k] unless v instanceof Function
    @defaults()
    
  defaults: ->
    @ambrosia_path = __dirname
    @ambrosia_stdlib_path = process.env['AMBROSIA_STDLIB_PATH'] || path.join(__dirname, '../../../tml')
    @ambrosia_file_ext = process.env['AMBROSIA_FILE_EXT'] || ".tml.ambrosia"
    @view_paths or= (=>
      paths = [
        path.join process.cwd(), 'views'
        path.join @ambrosia_stdlib_path, "std/views"
      ]
      p = process.env['AMBROSIA_VIEW_PATH']
      paths.unshift p if p and paths.indexOf(p) == -1
      paths
    )()

exports.$ = new PreprocessorVariables
