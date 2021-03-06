const includes = require("lodash/includes");
const trimEnd = require("lodash/trimEnd");
const readdir = require("fs-readdir-recursive");
const rimraf = require("rimraf");
const outputFileSync = require("output-file-sync");
const child = require("child_process");
const path = require("path");
const fs = require("fs");
const merge = require("lodash/merge");

const fixtureLoc = path.join(__dirname, "fixtures");
const tmpLoc = path.join(__dirname, "tmp");

function readFile(filename) {
    if (fs.existsSync(filename)) {
        let file = trimEnd(fs.readFileSync(filename, "utf8"));
        file = file.replace(/\r\n/g, "\n");
        return file;
    } else {
        return "";
    }
}

const readDir = function(loc) {
    const files = {};
    if (fs.existsSync(loc)) {
        readdir(loc).forEach(function(filename) {
            files[filename] = readFile(path.join(loc, filename));
        });
    }
    return files;
};

const assertTest = function(stdout, stderr, opts) {
    const expectStderr = opts.stderr.trim();
    stderr = stderr.trim();

    if (opts.stderr) {
        if (opts.stderrContains) {
            expect(includes(stderr, expectStderr)).toBe(true);
        } else {
            expect(stderr).toBe(expectStderr);
        }
    } else if (stderr) {
        throw new Error("stderr:\n" + stderr);
    }

    const expectStdout = opts.stdout.trim();
    stdout = stdout.trim();
    stdout = stdout.replace(/\\/g, "/");

    if (opts.stdout) {
        if (opts.stdoutContains) {
            expect(includes(stdout, expectStdout)).toBe(true);
        } else {
            expect(stdout).toBe(expectStdout);
        }
    } else if (stdout) {
        throw new Error("stdout:\n" + stdout);
    }
};

const buildTest = function(testName, opts) {
    const binLoc = path.join(__dirname, "../../bin/rabdg.js");

    return function(callback) {
        const dir = process.cwd();

        process.chdir(__dirname);
        if (fs.existsSync(tmpLoc)) rimraf.sync(tmpLoc);
        fs.mkdirSync(tmpLoc);
        process.chdir(tmpLoc);

        let args = [binLoc];

        args = args.concat(opts.args);

        const spawn = child.spawn(process.execPath, args);

        let stderr = "";
        let stdout = "";

        spawn.stderr.on("data", function(chunk) {
            stderr += chunk;
        });

        spawn.stdout.on("data", function(chunk) {
            stdout += chunk;
        });

        spawn.on("close", function() {
            let err;

            try {
                assertTest(stdout, stderr, opts);
            } catch (e) {
                err = e;
            }

            if (err) {
                err.message =
                    args.map(arg => `"${arg}"`).join(" ") + ": " + err.message;
            }

            process.chdir(dir);
            callback(err);
        });

        if (opts.stdin) {
            spawn.stdin.write(opts.stdin);
            spawn.stdin.end();
        }
    };
};

fs.readdirSync(fixtureLoc).forEach(function(testName) {
    const suiteLoc = path.join(fixtureLoc);
    describe("bin/rabbit-mermaid-cli", function() {
        if (testName[0] === ".") return;
        const testLoc = path.join(suiteLoc, testName);
        const opts = {
            args: []
        };

        const optionsLoc = path.join(testLoc, "options.json");
        if (fs.existsSync(optionsLoc)) merge(opts, require(optionsLoc));

        ["stdout", "stdin", "stderr"].forEach(function(key) {
            const extension = key === "stdin" ? ".json" : ".txt";
            const loc = path.join(testLoc, key + extension);
            if (fs.existsSync(loc) && extension === ".json") {
                opts.args.push(loc);
            }

            if (fs.existsSync(loc)) {
                opts[key] = readFile(loc);
            } else {
                opts[key] = opts[key] || "";
            }
        });

        it(testName, buildTest(testName, opts));
    });
});
