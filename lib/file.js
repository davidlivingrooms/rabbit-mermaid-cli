const defaults = require("lodash/defaults");
const slash = require("slash");
const path = require("path");
const fs = require("fs");
const { MermaidGenerator } = require("rabbit-mermaid");

module.exports = function(commander, opts) {
    let results = [];
    debugger;

    const processFile = function() {
        const filename = commander.filename;
        if (!fs.existsSync(filename)) return;

        fs.readFile(commander.filename, function read(err, data) {
            if (err) {
                throw err;
            }

            const json = JSON.parse(data);
            console.log(json);

            const memGen = new MermaidGenerator(json, opts);
            const dependencyGraph = memGen.generate();
            process.stdout.write(dependencyGraph);
        });
    };

    processFile();
};
