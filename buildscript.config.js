const { LOGGER } = require("node-build-util");

module.exports = {
    buildScripts: {
        start: () =>
        {
            LOGGER.log("Running script: 'start'");
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