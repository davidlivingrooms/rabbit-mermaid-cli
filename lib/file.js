const fs = require("fs");
const { MermaidGenerator } = require("rabbit-mermaid");

module.exports = function(commander) {
    let results = [];

    const processFile = function() {
        const filename = commander.filename;
        if (!fs.existsSync(filename)) return;

        fs.readFile(commander.filename, function read(err, data) {
            if (err) {
                throw err;
            }

            const options = {
                exchanges: commander.exchanges,
                showExToExBindings: commander.showExToExBindings
            };

            const json = JSON.parse(data);
            const memGen = new MermaidGenerator(json);
            const dependencyGraph = memGen.generate(options);
            process.stdout.write(dependencyGraph + "\n");
        });
    };

    processFile();
};
