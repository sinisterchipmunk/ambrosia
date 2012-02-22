(function() {
  var Base, EmbeddedTML, build_dom_from,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Base = require('nodes/base').Base;

  build_dom_from = require('dom').build_dom_from;

  exports.EmbeddedTML = EmbeddedTML = (function(_super) {

    __extends(EmbeddedTML, _super);

    function EmbeddedTML() {
      EmbeddedTML.__super__.constructor.apply(this, arguments);
    }

    EmbeddedTML.prototype.children = function() {
      return ['tml'];
    };

    EmbeddedTML.prototype.to_code = function() {
      return "`\n" + this.tml + "\n`";
    };

    EmbeddedTML.prototype.prepare = function() {};

    EmbeddedTML.prototype.compile = function(screen) {
      screen = screen.root.current_screen();
      build_dom_from(this.tml, screen);
      return "";
    };

    return EmbeddedTML;

  })(Base);

}).call(this);
