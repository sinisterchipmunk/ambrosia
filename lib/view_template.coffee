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
    @each_match '<%=', '%>', content, (match) ->
      # this is still hacky. Really, should eval the code in a new document with sub-scope from current level,
      # then insert the result / return value of the eval here.
      if v = context.current_scope().find(match.trim())
        "<getvar name=\"#{v.name}\" />"
      else throw new Error "Variable #{match.trim()} not found"
    
  process: (context, builder) ->
    content = @process_embedded_values @content, context, builder
    
    return content
