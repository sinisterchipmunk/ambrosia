{Base} = require './base'
TML = require '../tml'
path = require 'path'
fs = require 'fs'

exports.Require = class Require extends Base
  children: -> ['path']
  
  to_code: -> "require(#{@path})"
  
  prepare: ->
    @namespace = @path
    @namespace = @namespace.replace match[0], '.' while match = /[\/\\]/.exec @namespace
    @path = @path + ".tsl" if path.extname(@path) == ""
    @path = path.join(__dirname, '..', @path) unless @path[0] == '/' or @path[0] == '\\'

    return if @root().__dependencies[@path]
    @code = fs.readFileSync @path, 'UTF-8'
    @doc = TML.parse @code
    @doc.scope = @current_scope().root().sub @namespace

    @root().__dependencies[@path] = @doc

    @doc.run_prepare_blocks()
    
  compile: (builder) ->
    @doc.compile builder, false if @doc
    null