{Variable} = require './variable_scope'
{Assign} = require './nodes/assign'
{Identifier} = require './nodes/identifier'
{MethodCall} = require './nodes/method_call'
{Literal} = require './nodes/literal'

exports.ViewTemplate = class ViewTemplate
  constructor: (@content) ->
    
  each_match: (start_token, stop_token, content, callback) ->
    while (start = content.indexOf start_token) != -1
      stop = content.indexOf stop_token
      if stop == -1 or stop < start
        throw new Error "Unmatched #{start_token}"
      match = content.substring(start+start_token.length, stop)
      content = content.replace(start_token+match+stop_token, callback match)
      
    # if content.indexOf(stop_token) != -1
    #   throw new Error "Unmatched #{stop_token}"
    content
    
  create_id: (context) -> context.create Identifier, "embedded_#{@varid++}"
  
  assign_code_eval: (context, builder, code) ->
    id = @create_id context
    assign = context.create Assign, id, context.create MethodCall, context.create(Identifier, 'eval'), [context.create Literal, code.trim()]
    assign.compile builder
    return id.get_dependent_variable()
    
  process_embedded_values: (content, context, builder) ->
    @each_match '<%=', '%>', content, (match) =>
      result = @assign_code_eval context, builder, match
      "<getvar name=\"#{result.name}\" />"
      
  process_embedded_code: (content, context, builder) ->
    @each_match '<%', '%>', content, (code) =>
      call = context.create MethodCall, context.create(Identifier, 'eval'), [context.create Literal, code.trim()]
      call.compile builder
      ""
    
  process: (context, builder) ->
    @varid = 0
    content = @process_embedded_values @content, context, builder
    content = @process_embedded_code    content, context, builder
    
    return content
