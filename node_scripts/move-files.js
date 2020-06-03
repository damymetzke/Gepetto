const fs = require("fs");
const Color = require("./color");
const path = require("path");
const { Parse } = require("./parse-arguments");

const COLOR_COMMAND = [Color.EFFECTS["FG_RED"], Color.EFFECTS["BOLD"]];
const COLOR_ARGUMENT = [Color.EFFECTS['FG_YELLOW'], Color.EFFECTS["UNDERLINE"]];

EXPECTED_ARGUMENTS = {
    "watch": 0
};

function Run()
{
    const arguments = Parse(process.argv.slice(2), EXPECTED_ARGUMENTS);

    if (arguments.positional.length < 2)
    {
        Color.Log(
            "(file){'move-files.js'} called with less than 2 positional arguments. Expected form:\n"
            + "(command){node} (file){'*/move-files.js'} (argument){[input path]} (argument){[output path]} (argument){[test](optional)}",
            Color.ERROR,
            {
                file: Color.FILE,
                command: COLOR_COMMAND,
                argument: COLOR_ARGUMENT
            });
        return;
    }

    const inputPath = arguments.positional[0];
    const outputPath = arguments.positional[1];

    Color.Log(`Moving all files from (file){'${inputPath}'} to (file){'${outputPath}'}`, [],
        {
            file: Color.FILE
        });

    function ConvertFiles(relativePath)
    {
        const dir = path.join(inputPath, relativePath);
        const files = fs.readdirSync(dir);
        return files.map(file =>
        {
            return new Promise((resolve, reject) =>
            {
                let fullPath = path.join(dir, file);
                const stat = fs.statSync(fullPath);

                if (stat && stat.isDirectory())
                {
                    const promises = ConvertFiles(path.join(relativePath + file));
                    Promise.all(promises).then(values =>
                    {
                        resolve(values.reduce((accumelator, value) =>
                        {
                            return [...accumelator, ...value];
                        }, []));
                    });
                } else
                {
                    fs.readFile(path.join(inputPath, relativePath, file), (_err, data) =>
                    {
                        if (!fs.existsSync(path.join(outputPath, relativePath)))
                        {
                            fs.mkdirSync(path.join(outputPath, relativePath), { recursive: true });
                        }

                        fs.writeFile(path.join(outputPath, relativePath, file), data, () =>
                        {
                            resolve([{
                                source: path.join(inputPath, relativePath, file),
                                target: path.join(outputPath, relativePath, file),
                                error: null
                            }]);
                        });
                    });
                }
            });

        });
    }
    Promise.all(ConvertFiles("")).then(values =>
    {
        const results = values.reduce((accumelator, value) => [...accumelator, ...value], []);
    });
}

Run();

