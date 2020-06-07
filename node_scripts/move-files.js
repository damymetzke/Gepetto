const fs = require("fs");
const path = require("path");
const Color = require("./color");
const { Parse } = require("./parse-arguments");

const Walk = require("./walk-directories");

const REGEX_CONFIG_FILE_REFERENCE = /^\*([a-z]+)$/i;
const REGEX_ALL = /[^]*/;

const COLOR_COMMAND = [Color.EFFECTS["FG_RED"], Color.EFFECTS["BOLD"]];
const COLOR_ARGUMENT = [Color.EFFECTS['FG_YELLOW'], Color.EFFECTS["UNDERLINE"]];

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

        const match = arguments.positional[0].match(REGEX_CONFIG_FILE_REFERENCE);

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

                if (!(match[1] in CONFIG.directoryMaps.custom))
                {
                    throw (`config file reference '${match[1]}' was not found in config file '${CONFIG_PATH}' under the key 'directoryMaps.custom'`);
                }

                const configMappings = CONFIG.directoryMaps.custom[match[1]];
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

                return [{
                    from: arguments.positional[0],
                    to: arguments.positional[1],
                    test: arguments.positional.length >= 3 ? new RegExp(arguments.positional[2]) : REGEX_ALL
                }];
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
        return;
    }

    mappings.forEach(mapping =>
    {
        const { from, to, test } = mapping;
        Color.Log(`Moving all files from (file){'${from}'} to (file){'${to}'}`);

        Walk(from, "", test, (data, relative, file) =>
        {
            const outPath = path.join(to, relative, file);
            const outDir = path.join(to, relative);
            if (!fs.existsSync(outDir))
            {
                fs.mkdirSync(outDir, { recursive: true });
            }
            fs.writeFile(outPath, data, (error) =>
            {
                if (error)
                {
                    Color.Warn(`error writing to file (file){'${outPath}'}:\n${error}`);
                }
            });
        });
    });
}

Run();

