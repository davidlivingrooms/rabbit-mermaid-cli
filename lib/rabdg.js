"use strict";
const commander = require("commander");
const fileCommand = require("./file");

// Require logic.js file and extract controller functions using JS destructuring assignment
const { MermaidGenerator } = require("rabbit-mermaid");

commander.option(
    "-f, --filename [filename]",
    "filename to use when reading from stdin"
);

commander.option(
    "--only [list]",
    "list of exchanges to **only** generate dependency graphs for"
);
commander
    .version("0.0.1")
    .description(
        "CLI to generate markdown charts of your rabbitmq definition.json files."
    );

commander.parse(process.argv);
const opts = commander.opts();
console.log(opts);

fileCommand(commander, opts);
