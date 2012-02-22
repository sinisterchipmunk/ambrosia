{Document} = require 'nodes/document'

add_require = (head, path, rev) ->
  if rev
    rev = switch rev
      when 'tml' then 'text/tml'
      when 'css' then 'stylesheet'
      else rev
  else
    if /\.css$/.test path
      rev = 'stylesheet'
    else
      rev = 'text/tml'
      
  head.b 'link', href: path, rev: rev

Document.preprocessor 'require',
  (builder, path, rev) ->
    if head = builder.first('head')
      add_require head, path, rev
    else
      add_require builder.b('head'), path, rev
      
    ""