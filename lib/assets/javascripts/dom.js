(function() {
  var jsdom;

  jsdom = require('jsdom');

  exports.create_dom = function(code) {
    var div;
    if (jsdom) {
      div = jsdom.jsdom("<div>" + code + "</div>").childNodes[0];
    } else {
      div = document.createElement('div');
      div.innerHTML = code;
    }
    return div.childNodes;
  };

}).call(this);
