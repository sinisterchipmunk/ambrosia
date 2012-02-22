(function() {
  var PreprocessorVariables, path;

  path = require('path');

  PreprocessorVariables = (function() {

    function PreprocessorVariables() {
      this.defaults();
    }

    PreprocessorVariables.prototype.reset = function() {
      var k, v;
      for (k in this) {
        v = this[k];
        if (!(v instanceof Function)) delete this[k];
      }
      return this.defaults();
    };

    PreprocessorVariables.prototype.defaults = function() {
      var _this = this;
      this.ambrosia_path = __dirname;
      this.ambrosia_stdlib_path = process.env['AMBROSIA_STDLIB_PATH'] || path.join(__dirname, '../tml');
      this.ambrosia_file_ext = process.env['AMBROSIA_FILE_EXT'] || ".tml.ambrosia";
      return this.view_paths || (this.view_paths = (function() {
        var p, paths;
        paths = [path.join(process.cwd(), 'views'), path.join(_this.ambrosia_stdlib_path, "std/views")];
        p = process.env['AMBROSIA_VIEW_PATH'];
        if (p && paths.indexOf(p) === -1) paths.unshift(p);
        return paths;
      })());
    };

    return PreprocessorVariables;

  })();

  exports.$ = new PreprocessorVariables;

}).call(this);
