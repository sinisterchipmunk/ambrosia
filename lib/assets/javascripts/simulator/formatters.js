(function() {
  var Format,
    __slice = Array.prototype.slice;

  exports.Format = Format = (function() {

    function Format(type, format, string) {
      var format_pattern, formatter, match, _formatters, _i, _len, _match;
      this.string = string;
      this.formatters = [];
      _formatters = Format._formatters[type];
      if (!_formatters) {
        throw new Error("Couldn't find any formatters for type " + type + "!");
      }
      while (format.length > 0) {
        match = null;
        for (_i = 0, _len = _formatters.length; _i < _len; _i++) {
          formatter = _formatters[_i];
          formatter = __slice.call(formatter);
          format_pattern = formatter[0];
          if (format_pattern instanceof RegExp) {
            match = format_pattern.exec(format);
            if (match) {
              _match = match.shift();
              formatter.push(match);
              this.formatters.push(formatter);
              match = _match;
              break;
            }
          } else {
            if (format.indexOf(format_pattern) === 0) {
              match = format_pattern;
              formatter.push(match);
              this.formatters.push(formatter);
              break;
            }
          }
        }
        if (!match) this.formatters.push(match = format.substring(0, 1));
        format = format.replace(match, '');
      }
    }

    Format.prototype.process = function() {
      var callback, escaped, format, formatter, i, result, t, _i, _j, _len, _len2, _ref, _result;
      result = "";
      _ref = this.formatters;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        formatter = _ref[_i];
        if (typeof formatter === 'string') {
          result += formatter;
        } else {
          format = formatter[0];
          callback = formatter[1];
          t = callback.apply(null, [this.string].concat(__slice.call(formatter[2])));
          if (t && t[0]) {
            result += t[0];
            this.string = t[1];
          }
        }
      }
      escaped = false;
      _result = "";
      for (_j = 0, _len2 = result.length; _j < _len2; _j++) {
        i = result[_j];
        if (escaped === true) {
          _result += i;
          continue;
        }
        if (i === "\\") {
          escaped = true;
          continue;
        }
        _result += i;
      }
      return _result;
    };

    Format._formatters = {};

    Format.register = function(type, format, callback) {
      var index, _base, _ref;
      if (callback == null) callback = null;
      (_base = this._formatters)[type] || (_base[type] = []);
      for (index = 0, _ref = this._formatters[type].length; 0 <= _ref ? index < _ref : index > _ref; 0 <= _ref ? index++ : index--) {
        if (this._formatters[type][index][0].toString().length < format.toString().length) {
          return this._formatters[type].splice(index, 0, [format, callback]);
        }
      }
      return this._formatters[type].push([format, callback]);
    };

    return Format;

  })();

  Format.register('string', 'c', function(string) {
    var res;
    res = /^\D/.exec(string);
    return res && [res[0], string.replace(res[0], '')];
  });

  Format.register('string', 'c*', function(string) {
    var res;
    res = /^\D*/.exec(string);
    return res && [res[0], string.replace(res[0], '')];
  });

  Format.register('string', 'c#', function(string) {
    var res;
    res = /^\D/.exec(string);
    return res && ["*", string.substring(1, string.length)];
  });

  Format.register('string', 'c#*', function(string) {
    var i, res;
    res = /^\D*/.exec(string);
    return res && [
      ((function() {
        var _ref, _results;
        _results = [];
        for (i = 0, _ref = res[0].length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
          _results.push("*");
        }
        return _results;
      })()).join(""), string.substring(res[0].length, string.length)
    ];
  });

  Format.register('string', 'n', function(string) {
    var res;
    res = /^\d/.exec(string);
    return res && [res[0], string.replace(res[0], '')];
  });

  Format.register('string', 'n*', function(string) {
    var res;
    res = /^\d*/.exec(string);
    return res && [res[0], string.replace(res[0], '')];
  });

  Format.register('string', 'n#', function(string) {
    var res;
    res = /^\d/.exec(string);
    return res && ["*", string.substring(1, string.length)];
  });

  Format.register('string', 'n#*', function(string) {
    var i, res;
    res = /^\d*/.exec(string);
    return res && [
      ((function() {
        var _ref, _results;
        _results = [];
        for (i = 0, _ref = res[0].length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
          _results.push("*");
        }
        return _results;
      })()).join(""), string.substring(res[0].length, string.length)
    ];
  });

  Format.register('string', /^([cn])(\d+)/, function(string, c_or_n, digits) {
    var i, res;
    if (c_or_n === 'c') {
      res = new RegExp("^\\D{0," + digits + "}");
    } else {
      res = new RegExp("^\\d{0," + digits + "}");
    }
    if (res = res.exec(string)) {
      res = res[0];
      return [
        res + ((function() {
          var _ref, _results;
          _results = [];
          for (i = _ref = res.length; _ref <= digits ? i < digits : i > digits; _ref <= digits ? i++ : i--) {
            _results.push("-");
          }
          return _results;
        })()).join(""), string.substring(res.length, string.length)
      ];
    } else {
      return [
        ((function() {
          var _results;
          _results = [];
          for (i = 0; 0 <= digits ? i < digits : i > digits; 0 <= digits ? i++ : i--) {
            _results.push("-");
          }
          return _results;
        })()).join(""), string
      ];
    }
  });

  Format.register('string', /^([cn])#(\d+)/, function(string, c_or_n, digits) {
    var c, i, res;
    if (c_or_n === 'c') {
      res = new RegExp("^\\D{0," + digits + "}");
    } else {
      res = new RegExp("^\\d{0," + digits + "}");
    }
    if (res = res.exec(string)) {
      res = res[0];
      return [
        ((function() {
          var _ref, _results;
          _results = [];
          for (c = 0, _ref = res.length; 0 <= _ref ? c < _ref : c > _ref; 0 <= _ref ? c++ : c--) {
            _results.push("*");
          }
          return _results;
        })()).join("") + ((function() {
          var _ref, _results;
          _results = [];
          for (i = _ref = res.length; _ref <= digits ? i < digits : i > digits; _ref <= digits ? i++ : i--) {
            _results.push("*");
          }
          return _results;
        })()).join(""), string.substring(res.length, string.length)
      ];
    } else {
      return [
        ((function() {
          var _results;
          _results = [];
          for (i = 0; 0 <= digits ? i < digits : i > digits; 0 <= digits ? i++ : i--) {
            _results.push("*");
          }
          return _results;
        })()).join(""), string
      ];
    }
  });

}).call(this);
