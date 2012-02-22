(function() {
  var Base, Identifier, PropertyAccess,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Base = require('nodes/base').Base;

  Identifier = require('nodes/identifier').Identifier;

  exports.PropertyAccess = PropertyAccess = (function(_super) {

    __extends(PropertyAccess, _super);

    function PropertyAccess() {
      PropertyAccess.__super__.constructor.apply(this, arguments);
    }

    PropertyAccess.prototype.to_code = function() {
      return "" + (this.source.to_code()) + "." + (this.property_name.to_code());
    };

    PropertyAccess.prototype.children = function() {
      return ['source', 'property_name'];
    };

    PropertyAccess.prototype.type = function() {
      return this.result().type();
    };

    PropertyAccess.prototype.result = function() {
      var fail, self;
      self = this;
      fail = function() {
        var property_name, source_name;
        source_name = self.source.__proto__.constructor.name;
        property_name = self.property_name.__proto__.constructor.name;
        throw new Error("Don't know what to do with PropertyAccess(" + source_name + ", " + property_name + ")");
      };
      if (this.source instanceof Identifier) {
        console.log(this.source.get_dependent_variable());
      }
      return fail();
    };

    PropertyAccess.prototype.compile = function(b) {
      return this.result().compile(b);
    };

    return PropertyAccess;

  })(Base);

}).call(this);
