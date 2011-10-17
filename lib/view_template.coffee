{Variable} = require './variable_scope'

exports.ViewTemplate = class ViewTemplate
  constructor: (@content) ->
    
  each_match: (start_token, stop_token, content, callback) ->
    while (start = content.indexOf start_token) != -1
      stop = content.indexOf stop_token
      if stop == -1 or stop < start
        throw new Error "Unmatched #{start_token}"
      match = content.substring(start+start_token.length, stop)
      content = content.replace(start_token+match+stop_token, callback match)
      
    if content.indexOf(stop_token) != -1
      throw new Error "Unmatched #{stop_token}"
    content
    
  process_embedded_values: (content, context, builder) ->
    varid = 0
    {Assign} = require './nodes/assign'
    {Identifier} = require './nodes/identifier'
    {MethodCall} = require './nodes/method_call'
    {Literal} = require './nodes/literal'
    @each_match '<%=', '%>', content, (match) ->
      id = context.create Identifier, "embedded_#{varid++}"
      assign = context.create Assign, id, context.create MethodCall, context.create(Identifier, 'eval'), [context.create Literal, match.trim()]
      assign.compile builder
      result = id.get_dependent_variable()
      "<getvar name=\"#{result.name}\" />"
    
  process: (context, builder) ->
    content = @process_embedded_values @content, context, builder
    
    return content
