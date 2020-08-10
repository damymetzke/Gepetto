
const fs = require("fs");
const path = require("path");
const Color = require("./color");
const { Parse } = require("./parse-arguments");

const Walk = require("./walk-directories");
const { rejects } = require("assert");

//native enum
const ERROR_CODE = {
    SUCCESS: 0,
    INVALID_ARGUMENTS: 1,
    FILE_IO_ERROR: 2
};

const REGEX_CONFIG_FILE_REFERENCE = /^\*([a-z]+)$/i;
const REGEX_ALL = /[^]*/;

const COLOR_COMMAND = [ Color.EFFECTS[ "FG_RED" ], Color.EFFECTS[ "BOLD" ] ];
const COLOR_ARGUMENT = [ Color.EFFECTS[ 'FG_YELLOW' ], Color.EFFECTS[ "UNDERLINE" ] ];

const CONFIG_PATH = "./config/build.config.json";
const CONFIG = JSON.parse(fs.readFileSync(CONFIG_PATH));

EXPECTED_ARGUMENTS = {
    "watch": 0
};

function Run()
{
    const arguments = Parse(process.argv.slice(2), EXPECTED_ARGUMENTS);

    let mappings = [];

    try
    {
        if (arguments.positional.length === 0)
        {
            throw ("no positional arguments");
        }

        const match = arguments.positional[ 0 ].match(REGEX_CONFIG_FILE_REFERENCE);

        mappings = match ?
            (() =>
            {
                if (!("directoryMaps" in CONFIG))
                {
                    throw (`config file reference passed in as arguments, but config file '${CONFIG_PATH}' does not have a key 'directoryMaps'`);
                }

                if (!("custom" in CONFIG.directoryMaps))
                {
                    throw (`config file reference passed in as arguments, but config file '${CONFIG_PATH}' does not have a key 'directoryMaps.custom'`);
                }

                if (!(match[ 1 ] in CONFIG.directoryMaps.custom))
                {
                    throw (`config file reference '${match[ 1 ]}' was not found in config file '${CONFIG_PATH}' under the key 'directoryMaps.custom'`);
                }

                const configMappings = CONFIG.directoryMaps.custom[ match[ 1 ] ];
                return configMappings.map(mapping =>
                {
                    return {
                        from: ("from" in mapping) ? mapping.from : null,
                        to: ("to" in mapping) ? mapping.to : null,
                        test: ("test" in mapping) ? new RegExp(mapping.test) : REGEX_ALL
                    };
                });
            })() :
            (() =>
            {
                if (arguments.positional.length < 2)
                {
                    throw ("expected 2 arguments if no config file reference was provided");
                }

                return [ {
                    from: arguments.positional[ 0 ],
                    to: arguments.positional[ 1 ],
                    test: arguments.positional.length >= 3 ? new RegExp(arguments.positional[ 2 ]) : REGEX_ALL
                } ];
            })();
    }
    catch (error)
    {
        Color.Error(
            "error in (file){'move-files.js'} while parsing arguments:\n"
            + `${error}\n`
            + "expected:\n"
            + "(command){node} (file){'*/move-files.js'} (argument){[input path]} (argument){[output path]} (argument){[test](optional)}\n"
            + "or\n"
            + "(command){node} (file){'*/move-files.js'} (argument){*[config file reference]}",
            Color.ERROR,
            {
                command: COLOR_COMMAND,
                argument: COLOR_ARGUMENT
            });
        process.exit(ERROR_CODE.INVALID_ARGUMENTS);
    }

    const promises = mappings.map(mapping =>
    {
        return new Promise((resolve) =>
        {
            const { from, to, test } = mapping;
            Color.Log(`Moving all files from (file){'${from}'} to (file){'${to}'}`);

            let failCount = 0;

            let hasWrittenArray = [];

            Walk(from, "", test, (data, relative, file) =>
            {
                const outPath = path.join(to, relative, file);
                const outDir = path.join(to, relative);
                if (!fs.existsSync(outDir))
                {
                    fs.mkdirSync(outDir, { recursive: true });
                }
                hasWrittenArray.push(new Promise((resolve, reject) =>
                {
                    fs.writeFile(outPath, data, (error) =>
                    {
                        if (error)
                        {
                            Color.Error(`error writing to file (file){'${outPath}'}:\n${error}`);
                            ++failCount;
                            reject(error);
                        }
                        resolve();
                    });
                }));
            })
                .then(() =>
                {
                    return Promise.all(hasWrittenArray);
                })
                .then(() =>
                {
                    resolve(failCount);
                })
                .catch((error) =>
                {
                    rejects(error);
                });

        });
    });

    Promise.all(promises)
        .then((fails) =>
        {
            const failedMappings = fails.filter(fail => fail !== 0);
            if (failedMappings.length === 0)
            {
                process.exit(ERROR_CODE.SUCCESS);
            }

            const totalFails = failedMappings.reduce((sum, fail) => sum + fail, 0);

            Color.Error(`encounterd ${totalFails} file IO errors over ${failedMappings.length} file mappings`);
            process.exit(ERROR_CODE.FILE_IO_ERROR);
        })
        .catch((error) =>
        {
            Color.Error(`File IO error:\n${error}`);
            process.exit(ERROR_CODE.FILE_IO_ERROR);
        });
}

Run();

