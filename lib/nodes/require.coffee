{Extension} = require './extension'
TML = require '../tml'
path = require 'path'
fs = require 'fs'

exports.Require = class Require extends Extension
  children: -> ['path']
  
  to_code: -> "require(#{@path})"
  
  prepare: ->
    _path = @path
    _path = _path + ".tsl" if path.extname(_path) == ""
    _path = path.join(__dirname, '..', _path) unless _path[0] == '/' or _path[0] == '\\'
    
    @namespace = @path
    @namespace = @namespace.replace match[0], '.' while match = /[\/\\]/.exec @namespace
    @namespace = "." + @namespace unless @namespace[0] == '.'

    return if @root().__dependencies[@namespace]
    @code = fs.readFileSync _path, 'UTF-8'
    
  compile: (builder) ->
    @invoke builder, "eval", @code, @namespace
