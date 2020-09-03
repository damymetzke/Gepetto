const { LOGGER, runParallelScript, runNpm, stdLib, runScript, runBin, runBuildScript } = require("node-build-util");
const _ = require("lodash");

const path = require("path");

const DEFAULT_PATHS = {
    html: [
        path.join(__dirname, "html"),
        path.join(__dirname, "out")
    ],
    coreFront: [
        "./src/core",
        "./src/front/core"
    ],
    coreBack: [
        "./src/core",
        "./src/back/core"
    ],
    coreTest: [
        "./src/core",
        "./src/test/core"
    ],
    markdown: [
        path.join(__dirname, "documentation/md"),
        path.join(__dirname, "documentation/build/md")
    ],
    sass: [
        path.join(__dirname, "style"),
        path.join(__dirname, "out/style")
    ]
};

const SCRIPT = {
    md: path.join(__dirname, "scripts/buildMd.js"),
    sass: path.join(__dirname, "scripts/compileSass.js"),
    prepareTypedoc: path.join(__dirname, "scripts/prepareTypedoc.js")
};

//scripts
/////////
const copyHtml = _.bind(
    runParallelScript, null,
    "std:fileSystem/copyFolder.js",

    path.join(__dirname, "html"),
    path.join(__dirname, "out"));

const compileSass = _.bind(
    runParallelScript, null,
    path.join(__dirname, "scripts/compileSass.js"),

    path.join(__dirname, "style"),
    path.join(__dirname, "out/style")
);

function makePrepare(from, to)
{
    return _.bind(
        runParallelScript, null,
        "std:fileSystem/copyFolder.js",

        from, to
    );
}
const prepareFront = makePrepare("./src/core", "./src/front/core");
const prepareBack = makePrepare("./src/core", "./src/back/core");
const prepareTest = makePrepare("./src/core", "./src/test/core");

function makeCompileTs(tsconfigPath)
{
    return _.bind(
        runBin, null,
        "tsc",

        [ "-p", tsconfigPath ]
    );
}

const compileTsFront = makeCompileTs("./config/front.tsconfig.json");
const compileTsBack = makeCompileTs("./config/back.tsconfig.json");
const compileTsTest = makeCompileTs("./config/test.tsconfig.json");

const run = _.bind(
    runBin, null,
    "electron",

    [ "." ]
);

const test = _.bind(
    runBin, null,
    "jest",

    []
);

const renderMd = _.bind(
    runParallelScript, null,
    path.join(__dirname, "scripts/buildMd.js"),

    path.join(__dirname, "documentation/md"),
    path.join(__dirname, "documentation/build/md")
);

const renderTypeDoc = _.bind(
    runBin, null,
    "typedoc",

    [
        "./intermediate/typedoc_src",
        "--out", "./documentation/build/typedoc-output",
        "--tsconfig", "./config/tsconfig.json",
        "--exclude", "./src/front/core",
        "--exclude", "./src/back/core",
        "--exclude", "./src/test/core"
    ]

);

//export
////////
module.exports = {
    buildScripts: {
        start: async () =>
        {
            LOGGER.log("Running script: 'start'");
            LOGGER.log("Compiling...");

            const htmlAndSass = [
                copyHtml(),
                compileSass()
            ];

            await Promise.all([
                prepareFront(),
                prepareBack()
            ]);

            await Promise.all([
                compileTsFront(),
                compileTsBack(),
                ...htmlAndSass
            ]);

            LOGGER.log("Compilation complete, starting Electron instance.");
            await run();
            LOGGER.log("Electron instance closed.");
        },
        test: async () =>
        {
            LOGGER.log("Running script: 'test'");
            LOGGER.log("Running tests using jest framework.");

            await prepareTest();
            await compileTsTest();
            await test();
            LOGGER.log("Tests completed successfully.");
        },
        buildDocs: async () =>
        {
            LOGGER.log("Running script: 'buildDocs'");

            const buildDocs = (async () =>
            {
                LOGGER.log("Building markdown documentation...");
                await renderMd();
                LOGGER.log("Completed building markdown documentation.");
            })();

            await runParallelScript(SCRIPT.prepareTypedoc);

            await Promise.all([
                (async () =>
                {
                    LOGGER.log("Building typedoc documentation...");
                    await renderTypeDoc();
                    LOGGER.log("Completed building typedoc documentation.");
                })(),
                buildDocs
            ]);
            LOGGER.log("successfully build all documentation.");
        },
        clean: async () =>
        {
            LOGGER.log("Running script: 'clean'");
            await runNpm("old:clean"); //todo: create script
        },
        package: async () =>
        {
            LOGGER.log("Running script: 'package'");
            await runNpm("old:clean"); //todo: create script

            await Promise.all([
                (async () => //testing
                {
                    await prepareTest();
                    await compileTsTest();
                    await test();
                })(),
                (async () => //build app
                {
                    const htmlAndSass = [
                        copyHtml(),
                        compileSass()
                    ];

                    await Promise.all([
                        prepareFront(),
                        prepareBack()
                    ]);

                    await Promise.all([
                        compileTsFront(),
                        compileTsBack(),
                        ...htmlAndSass
                    ]);
                })(),
                (async () => //build docs
                {
                    runBuildScript("buildDocs");
                })()
            ]);

            await runBin("electron-builder", [ "--dir" ]);
        },
        distribute: async () =>
        {
            LOGGER.log("Running script: 'distribute'");

            await runNpm("old:clean"); //todo: create script

            await Promise.all([
                (async () => //testing
                {
                    await prepareTest();
                    await compileTsTest();
                    await test();
                })(),
                (async () => //build app
                {
                    const htmlAndSass = [
                        copyHtml(),
                        compileSass()
                    ];

                    await Promise.all([
                        prepareFront(),
                        prepareBack()
                    ]);

                    await Promise.all([
                        compileTsFront(),
                        compileTsBack(),
                        ...htmlAndSass
                    ]);
                })(),
                (async () => //build docs
                {
                    runBuildScript("buildDocs");
                })()
            ]);

            await runBin("electron-builder", [ "--dir" ]);
        }
    }
};