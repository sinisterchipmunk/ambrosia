(function() {
  var Builtins, CastValue, DefaultVariableValue, Literalize, VariableValue;

  Builtins = require('builtins').Builtins;

  exports.DefaultVariableValue = DefaultVariableValue = function(variable) {
    return CastValue(variable.attrs.value, variable.attrs.type);
  };

  exports.CastValue = CastValue = function(value, type) {
    var result;
    value = (value === void 0 ? "" : value).toString();
    switch (type) {
      case 'integer':
        result = parseInt(value);
        if (isNaN(result) || !isFinite(result)) result = 0;
        return result;
      case 'datetime':
        return new Date(value);
      case 'opaque':
      case 'string':
        return value;
      default:
        return value;
    }
  };

  exports.VariableValue = VariableValue = function(variable_state, varname) {
    var variable;
    variable = variable_state[varname] || (variable_state[varname] = Builtins.descriptor_for(varname));
    if (variable === void 0) throw new Error("Undefined variable: " + varname);
    return variable;
  };

  exports.Literalize = Literalize = function(variable_state, value, type) {
    var match, v;
    while (match = /tmlvar:([^;]+)/.exec(value.toString())) {
      v = VariableValue(variable_state, match[1]).value;
      value = value.replace(match[0], v);
    }
    return CastValue(value, type);
  };

}).call(this);
