const { LOGGER, runParallelScript, runNpm, stdLib, runScript } = require("node-build-util");

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
    sass: path.join(__dirname, "scripts/compileSass.js")
};

module.exports = {
    buildScripts: {
        start: async () =>
        {
            LOGGER.log("Running script: 'start'");
            LOGGER.log("Compiling...");

            const htmlAndSass = [
                runParallelScript("std:fileSystem/copyFolder.js", ...DEFAULT_PATHS.html),
                runParallelScript(SCRIPT.sass, ...DEFAULT_PATHS.sass)
            ];

            await Promise.all([
                runParallelScript("std:fileSystem/copyFolder.js", ...DEFAULT_PATHS.coreFront),
                runParallelScript("std:fileSystem/copyFolder.js", ...DEFAULT_PATHS.coreBack),
            ]);

            await Promise.all([
                runNpm("old:typescript-front"), //todo: run bin
                runNpm("old:typescript-back"),  //todo: run bin
                ...htmlAndSass
            ]);

            LOGGER.log("Compilation complete, starting Electron instance.");
            await runNpm("old:start"); //todo: run bin
            LOGGER.log("Electron instance closed.");
        },
        test: async () =>
        {
            LOGGER.log("Running script: 'test'");
            LOGGER.log("Running tests using jest framework.");

            const [ source, target ] = DEFAULT_PATHS.coreTest;
            await stdLib.fileSystem.copyFolder(source, target);
            await runNpm("old:typescript-test"); //todo: run bin
            await runNpm("old:test"); //todo: run bin
            LOGGER.log("Tests completed successfully.");
        },
        buildDocs: async () =>
        {
            LOGGER.log("Running script: 'buildDocs'");

            const buildDocs = (async () =>
            {
                LOGGER.log("Building markdown documentation...");
                await runScript(SCRIPT.md, ...DEFAULT_PATHS.markdown);
                LOGGER.log("Completed building markdown documentation.");
            })();

            await Promise.all([
                runParallelScript("std:fileSystem/copyFolder.js", ...DEFAULT_PATHS.coreFront),
                runParallelScript("std:fileSystem/copyFolder.js", ...DEFAULT_PATHS.coreBack),
                runParallelScript("std:fileSystem/copyFolder.js", ...DEFAULT_PATHS.coreTest)
            ]);

            await runNpm("old:prepare-typedoc");

            await Promise.all([
                (async () =>
                {
                    LOGGER.log("Building typedoc documentation...");
                    runNpm("old:build-typedoc"); //todo: run bin
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
                    const [ source, target ] = DEFAULT_PATHS.coreTest;
                    await stdLib.fileSystem.copyFolder(source, target);
                    await runNpm("old:typescript-test"); //todo: run bin
                    await runNpm("old:test"); //todo: run bin
                })(),
                (async () => //build app
                {
                    const htmlAndSass = [
                        runParallelScript("std:fileSystem/copyFolder.js", ...DEFAULT_PATHS.html),
                        runParallelScript(SCRIPT.sass, ...DEFAULT_PATHS.sass)
                    ];

                    await Promise.all([
                        runParallelScript("std:fileSystem/copyFolder.js", ...DEFAULT_PATHS.coreFront),
                        runParallelScript("std:fileSystem/copyFolder.js", ...DEFAULT_PATHS.coreBack),
                    ]);

                    await Promise.all([
                        runNpm("old:typescript-front"), //todo: run bin
                        runNpm("old:typescript-back"), //todo: run bin
                        ...htmlAndSass
                    ]);
                })()
            ]);

            await runNpm("old:pack"); //todo: run bin
        },
        distribute: async () =>
        {
            LOGGER.log("Running script: 'distribute'");

            await runNpm("old:clean"); //todo: create script

            await Promise.all([
                (async () => //testing
                {
                    const [ source, target ] = DEFAULT_PATHS.coreTest;
                    await stdLib.fileSystem.copyFolder(source, target);
                    await runNpm("old:typescript-test"); //todo: run bin
                    await runNpm("old:test"); //todo: run bin
                })(),
                (async () => //build app
                {
                    const htmlAndSass = [
                        runParallelScript("std:fileSystem/copyFolder.js", ...DEFAULT_PATHS.html),
                        runParallelScript(SCRIPT.sass, ...DEFAULT_PATHS.sass)
                    ];

                    await Promise.all([
                        runParallelScript("std:fileSystem/copyFolder.js", ...DEFAULT_PATHS.coreFront),
                        runParallelScript("std:fileSystem/copyFolder.js", ...DEFAULT_PATHS.coreBack),
                    ]);

                    await Promise.all([
                        runNpm("old:typescript-front"), //todo: run bin
                        runNpm("old:typescript-back"), //todo: run bin
                        ...htmlAndSass
                    ]);
                })()
            ]);

            await runNpm("old:dist"); //todo: run bin
        }
    }
};