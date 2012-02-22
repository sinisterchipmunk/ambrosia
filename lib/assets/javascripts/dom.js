(function() {
  var jsdom;

  jsdom = require('jsdom');

  exports.create_dom = function(code) {
    var div, parser, xmlDoc;
    code = "<div>" + code + "</div>";
    if (jsdom) {
      div = jsdom.jsdom(code).childNodes[0];
    } else {
      parser = new DOMParser();
      xmlDoc = parser.parseFromString(code, "text/xml");
      div = xmlDoc.documentElement;
    }
    return div.childNodes;
  };

}).call(this);
