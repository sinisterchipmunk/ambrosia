{Document} = require '../nodes/document'
path = require 'path'
fs = require 'fs'

Document.preprocessor 'require',
  (builder, _path) ->
    @namespace = _path
    _path = _path + ".tsl" if path.extname(_path) == ""
    _path = path.join(__dirname, '..', _path) unless _path[0] == '/' or _path[0] == '\\'
  
    @namespace = @namespace.replace match[0], '.' while match = /[\/\\]/.exec @namespace
    @namespace = "." + @namespace unless @namespace[0] == '.'

    return @create(Literal, "") if @root().__dependencies[@namespace]
    
    @code = fs.readFileSync _path, 'UTF-8'
    @invoke builder, "eval", @code, @namespace
    return @create Literal, ""
