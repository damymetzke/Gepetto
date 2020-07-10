const walk = require("./walk-directories.js");
const path = require("path");
const fs = require("fs").promises;
const Color = require("./color");

const REGEX_IGNORE_FILE = /^(?:(?:front)|(?:back)|(?:test))[\/\\]core/i;
const REGEX_IMPORT_REPLACE = /import\s*({[^{}]*}|\*\s*as\s*[a-z][a-z0-9]*)\s*from\s*"([^"]+)"/gi;

walk("./src", "", /[^]*/, (data, relative, file) =>
{
    if (REGEX_IGNORE_FILE.test(relative))
    {
        return;
    }

    const converted = data.toString().replace(REGEX_IMPORT_REPLACE, (match, definitions, importPath) =>
    {
        const importDestination = path.join(relative, importPath);
        const newDestination = REGEX_IGNORE_FILE.test(importDestination)
            ? path.join("..", importPath).replace(/[\\]/g, "/")
            : importPath;

        return `import ${definitions} from "${newDestination}"`;

    });

    const writeDirectory = path.join("./intermediate/typedoc_src", relative);
    const writeTarget = path.join(writeDirectory, file);
    fs.mkdir(writeDirectory, { recursive: true })
        .then(() => fs.writeFile(writeTarget, converted))
        .catch(error =>
        {
            Color.Error(`error writing to file (file){'${writeTarget}'}:\n${error}`);
        });
});