jsdom = require('jsdom')
# jsdom and= jsdom.jsdom

exports.create_dom = (code) ->
  code = "<div>#{code}</div>"
  
  if jsdom
    div = jsdom.jsdom(code).childNodes[0]
  else
    parser = new DOMParser()
    xmlDoc = parser.parseFromString code, "text/xml"
    div = xmlDoc.documentElement
    
  div.childNodes
