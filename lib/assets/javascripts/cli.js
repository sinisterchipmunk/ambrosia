(function() {
  var CLI, Simulator, fs, tml,
    __slice = Array.prototype.slice;

  fs = require('fs');

  tml = require('tml');

  Simulator = require("simulator").Simulator;

  exports.CLI = CLI = (function() {

    function CLI() {}

    CLI.prototype.exec = function(script) {
      var dom, sim;
      dom = tml.parse(script).compileDOM();
      sim = new Simulator(dom);
      sim.start();
      return console.log(sim.state.variables["return"].value);
    };

    CLI.prototype.compile_script = function(script) {
      return console.log(tml.compile(script).toString());
    };

    CLI.prototype.compile = function() {
      var dom, filename, match, results, sources, _results;
      sources = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      results = tml.compile_files.apply(tml, sources);
      _results = [];
      for (filename in results) {
        dom = results[filename];
        if (sources.length === 1) {
          _results.push(console.log(dom.toString()));
        } else {
          if (match = /^(.*)\.([^\.]*)$/.exec(filename)) filename = match[1];
          filename += ".tml";
          _results.push(fs.writeFile(filename, dom.toString(), function(err) {
            if (err) throw err;
            return console.log("(Wrote file " + filename + ")");
          }));
        }
      }
      return _results;
    };

    return CLI;

  })();

}).call(this);
