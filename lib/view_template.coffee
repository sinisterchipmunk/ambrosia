{Variable} = require './variable_scope'
{Assign} = require './nodes/assign'
{Identifier} = require './nodes/identifier'
{MethodCall} = require './nodes/method_call'
{Literal} = require './nodes/literal'

path = require 'path'
fs = require 'fs'

exports.ViewTemplate = class ViewTemplate
  varid = 0
  
  @find: (filename, view_path = process.env['AMBROSIA_VIEW_PATH'] or path.join process.cwd(), 'views') ->
    if filename[0] == /[//\\]/
      filepath = filename
    else
      filepath = path.join view_path, filename
    unless path.extname filepath
      filepath = "#{filepath}.xml"
    
    ViewTemplate.views or= {}
    ViewTemplate.views[filepath] or= new ViewTemplate fs.readFileSync filepath, 'UTF-8'
    

  constructor: (@content) ->
    
  each_match: (start_token, stop_token, content, callback) ->
    while (start = content.indexOf start_token) != -1
      stop = content.indexOf stop_token
      if stop == -1 or stop < start
        throw new Error "Unmatched #{start_token}"
      match = content.substring(start+start_token.length, stop)
      content = content.replace(start_token+match+stop_token, callback match)

    content
    
  create_id: -> @context.create Identifier, "embedded_#{varid++}"
  
  process_code: (code) ->
    @context.create MethodCall, @context.create(Identifier, 'eval'), [@context.create Literal, code.trim()]
  
  assign_code_eval: (code) ->
    result = @process_code(code).compile @builder
    if result instanceof Variable
      id = @create_id()
      assign = @context.create Assign, id, @context.create Identifier, result.name #@process_code code
      assign.compile @builder
      "<getvar name=\"#{result.name}\" />"
    else
      result
    
  process_embedded_values: (content) ->
    @each_match '<%=', '%>', content, (match) =>
      @assign_code_eval match
      
  process_embedded_code: (content) ->
    @each_match '<%', '%>', content, (code) =>
      call = @process_code code
      call.compile @builder
      ""
    
  process: (context, builder) ->
    @context = context
    @builder = builder
    
    content = @process_embedded_values @content
    content = @process_embedded_code    content
    
    return content

exports.Layout = class Layout extends ViewTemplate
  # process_code: (code) ->
  #   # simple string substitution for any 'yield()'. TODO it may be prudent to do something more robust.
  #   if match = /yield[\s\t\n]*\([\s\t\n]*\)[\s\t\n]*;?/.exec code
  #     code.replace match[0], @inner_template
  #   else
  #     super code
  #   
  # process: (@inner_template, context, builder) ->
  #   
  #   super context, builder
