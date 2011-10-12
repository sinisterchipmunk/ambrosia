{Base} = require './base'
{TMLBuilder} = require '../tml_builder'
{VariableScope}  = require '../variable_scope'

exports.Document = class Document extends Base
  constructor: (nodes...) ->
    @scope = new VariableScope
    @methods = {}
    @__dependencies = {}
    super
    
  instance_name: ->
    @current_scope().prefix() + super
    
  silently_find_method: (name) ->
    return @methods[name] if @methods[name]
    retval = null
    @each_dependency (dep) -> 
      retval or= method if method = dep.silently_find_method name
    retval
    
  each_dependency: (callback) ->
    for dep, doc of @__dependencies
      callback doc
  
  find_method: (name) ->
    return method if method = @silently_find_method name
    throw new Error "No method named #{name}"
    
  children: -> ['block']
    
  to_code: -> @block.to_code()
    
  prepare: ->
    @each_dependency (dep) -> dep.run_prepare_blocks()
    
  compileDOM: (builder = new TMLBuilder) ->
    # it's safe to call this repeatedly because `Base` will ignore subsequent calls
    @run_prepare_blocks()
    @find_method('__main__').compile builder
    # important to compile scopes last, because method nodes are still building them until now
    @current_scope().compile builder
    builder
    
  compile: (builder, optimize = true) ->
    @compileDOM(builder).root.toString()
