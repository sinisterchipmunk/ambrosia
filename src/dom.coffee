jsdom = require('jsdom')
# jsdom and= jsdom.jsdom

exports.create_dom = (code) ->
  if jsdom
    div = jsdom.jsdom("<div>#{code}</div>").childNodes[0]
  else
    div = document.createElement('div')
    div.innerHTML = code
    
  div.childNodes
