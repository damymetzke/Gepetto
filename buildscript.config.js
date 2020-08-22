const { LOGGER, runParallelScript, runNpm } = require("node-build-util");

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
    ]
};

module.exports = {
    buildScripts: {
        start: async () =>
        {
            LOGGER.log("Running script: 'start'");

            const htmlAndSass = [
                runParallelScript("std:fileSystem/copyFolder.js", ...DEFAULT_PATHS.html),
                runNpm("old:compile-sass")
            ];

            await Promise.all([
                runParallelScript("std:fileSystem/copyFolder.js", ...DEFAULT_PATHS.coreFront),
                runParallelScript("std:fileSystem/copyFolder.js", ...DEFAULT_PATHS.coreBack),
            ]);

            await Promise.all([
                runNpm("old:typescript-front"),
                runNpm("old:typescript-back"),
                ...htmlAndSass
            ]);

            runNpm("old:start");
        },
        test: () =>
        {
            LOGGER.log("Running script: 'test'");

        },
        buildDocs: () =>
        {
            LOGGER.log("Running script: 'buildDocs'");

        },
        package: () =>
        {
            LOGGER.log("Running script: 'package'");

        },
        distribute: () =>
        {
            LOGGER.log("Running script: 'distribute'");

        }
    }
};