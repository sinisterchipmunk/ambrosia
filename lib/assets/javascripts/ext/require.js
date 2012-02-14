(function() {
  var Document, fs, path;

  Document = require('nodes/document').Document;

  path = require('path');

  fs = require('fs');

  Document.preprocessor('require', function(builder, _path) {
    var match;
    this.namespace = _path;
    if (path.extname(_path) === "") _path = _path + $.ambrosia_file_ext;
    if (!(_path[0] === '/' || _path[0] === '\\')) {
      _path = path.join($.ambrosia_stdlib_path, _path);
    }
    while (match = /[\/\\]/.exec(this.namespace)) {
      this.namespace = this.namespace.replace(match[0], '.');
    }
    if (this.namespace[0] !== '.') this.namespace = "." + this.namespace;
    if (this.root().__dependencies[this.namespace]) {
      return this.create(Literal, "");
    }
    this.code = fs.readFileSync(_path, 'UTF-8');
    return this.invoke(builder, "eval", this.code, this.namespace) || this.create(Literal, "");
  });

}).call(this);
