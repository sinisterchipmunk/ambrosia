(function() {
  var Closure, Method,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Method = require('nodes/method').Method;

  exports.Closure = Closure = (function(_super) {

    __extends(Closure, _super);

    function Closure() {
      Closure.__super__.constructor.apply(this, arguments);
    }

    Closure.__closure_id || (Closure.__closure_id = 0);

    Closure.prototype.getID = function() {
      return this.id || (this.id = "_closure_" + ++Closure.__closure_id);
    };

    Closure.prototype.children = function() {
      return ['params', 'block'];
    };

    Closure.prototype.to_code = function() {
      var param;
      return "(" + (((function() {
        var _i, _len, _ref, _results;
        _ref = this.params;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          param = _ref[_i];
          _results.push(param.to_code);
        }
        return _results;
      }).call(this)).join(', ')) + ") ->\n" + (this.block.to_code());
    };

    return Closure;

  })(Method);

}).call(this);
