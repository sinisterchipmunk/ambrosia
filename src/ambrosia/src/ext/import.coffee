{Document} = require 'nodes/document'
{Literal} = require 'nodes/literal'
path = require 'path'
fs = require 'fs'

Document.preprocessor 'import',
  (builder, _path) ->
    @namespace = _path
    _path = _path + $.ambrosia_file_ext if path.extname(_path) == ""
    _path = path.join($.ambrosia_stdlib_path, _path) unless _path[0] == '/' or _path[0] == '\\'
  
    @namespace = @namespace.replace match[0], '.' while match = /[\/\\]/.exec @namespace
    @namespace = "." + @namespace unless @namespace[0] == '.'

    return @create(Literal, "") if @root().__dependencies[@namespace]
    
    @code = fs.readFileSync _path, 'UTF-8'
    @invoke(builder, "eval", @code, @namespace) or @create Literal, ""
