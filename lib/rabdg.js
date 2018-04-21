"use strict";
const commander = require("commander");
const fileCommand = require("./file");

const { MermaidGenerator } = require("rabbit-mermaid");

function list(val) {
    return val.split(",");
}

commander.option(
    "-f, --filename [filename]",
    "filename to use when reading from stdin"
);

commander.option(
    "-x, --showExToExBindings",
    "show exchange to exchange bindings in the ouput. Warning: This can make your graph layout harder to follow."
);

commander.option(
    "-e, --exchanges <items>",
    "list of exchanges to generate dependency graphs for",
    list
);
commander
    .version("0.0.1")
    .description(
        "CLI to generate markdown charts of your rabbitmq definition.json files."
    );

commander.parse(process.argv);
fileCommand(commander);
