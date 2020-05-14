const typescript = require("typescript");
const fs = require("fs");
const Color = require("./color.js");

const ROOT = "./src/";

const ES6_SOURCES = [
    "front/"
];

const NODE_SOURCES = [
    "back/",
    "core/",
    "test/"
];

const GLOBAL_OPTIONS = {
    "outDir": "./out/src/",
    "target": typescript.ScriptTarget.ES2019,
    "allowJs": true,
    "moduleResolution": typescript.ModuleResolutionKind.NodeJs
};

const TARGET_OPTIONS = {
    "ES6": {
        "module": typescript.ModuleKind.ES2019
    },
    "NODE": {
        "module": typescript.ModuleKind.CommonJS
    }
};

function WalkFiles(relative)
{
    const relativeFiles = fs.readdirSync(ROOT + relative);
    return relativeFiles.reduce((accumelator, file) =>
    {
        const stats = fs.statSync(ROOT + relative + file);
        if (stats.isDirectory())
        {
            return [...accumelator, ...WalkFiles(relative + file + "/")];
        }

        return [...accumelator, relative + file];
    }, []);
}

function Run()
{
    function GetInput(sources)
    {
        return sources.reduce((accumelator, sources) =>
        {
            return [...accumelator, ...WalkFiles(sources)];
        }, []).map((source) =>
        {
            return ROOT + source;
        });
    }
    const es6Input = GetInput(ES6_SOURCES);
    const nodeInput = GetInput(NODE_SOURCES);

    let nodeProgram = typescript.createProgram(nodeInput, { ...GLOBAL_OPTIONS, ...TARGET_OPTIONS["NODE"] });
    let es6Program = typescript.createProgram(es6Input, { ...GLOBAL_OPTIONS, ...TARGET_OPTIONS["ES6"] });

    let allDiagnostics = [
        ...typescript.getPreEmitDiagnostics(nodeProgram),
        ...nodeProgram.emit().diagnostics,
        ...typescript.getPreEmitDiagnostics(es6Program),
        ...es6Program.emit().diagnostics
    ];

    allDiagnostics.forEach((diagnostic) =>
    {
        if (diagnostic.file)
        {
            let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
            let message = typescript.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
            Color.Log(`(file){${diagnostic.file.fileName}} (L:${line + 1}, C:${character + 1}): (message){${message}}`, [], {
                file: Color.FILE,
                message: Color.WARN
            });
        } else
        {
            Color.Log(typescript.flattenDiagnosticMessageText(diagnostic.messageText, "\n"), Color.WARN);
        }
    });
}

Run();