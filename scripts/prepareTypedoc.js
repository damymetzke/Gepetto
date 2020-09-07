const { stdLib } = require("node-build-util");
const path = require("path");
const { FileCallbackResult, walk } = require("node-build-util/lib/std/fileSystem/walk");
const { promises: fs } = require("fs");
const _ = require("lodash");

const REGEX_IMPORT_REPLACE = /import\s*({[^{}]*}|\*\s*as\s*[a-z][a-z0-9]*)\s*from\s*"([^"]+)"/gi;

const PROHIBITED_FOLDERS = [
    path.join(__dirname, "../src/front/core"),
    path.join(__dirname, "../src/back/core"),
    path.join(__dirname, "../src/test/core")
];

async function scriptMain()
{
    walk(
        path.join(__dirname, "../src"),
        path.join(__dirname, "../intermediate/typedoc_src"),
        async (sourcePath, fileName, outputFolder) =>
        {
            if (
                PROHIBITED_FOLDERS.some(folder =>
                {
                    const prohibited = path.resolve(folder);
                    const actual = path.dirname(sourcePath);

                    if (actual.length < prohibited.length)
                    {
                        return false;
                    }

                    const actualTest = actual.slice(0, prohibited.length);

                    return (actualTest === prohibited);
                })
            )
            {
                return FileCallbackResult.FILE_IGNORED;
            }

            const data = await fs.readFile(sourcePath);

            const converted = data.toString().replace(REGEX_IMPORT_REPLACE, (match, definitions, importPath) =>
            {
                let nextImport = "";
                for (let i = 0; i < PROHIBITED_FOLDERS.length; ++i)
                {
                    const folder = PROHIBITED_FOLDERS[ i ];
                    const prohibited = path.resolve(folder);
                    const actual = path.resolve(path.dirname(sourcePath), importPath);

                    if (actual.length < prohibited.length)
                    {
                        continue;
                    }

                    const actualTest = actual.slice(0, prohibited.length);

                    if (actualTest === prohibited)
                    {
                        const after = actual.slice(prohibited.length);
                        nextImport = path.join(prohibited, "../../core", after);

                        const relativeImport = path.relative(
                            path.dirname(sourcePath),
                            nextImport
                        );
                        nextImport = relativeImport;
                    }
                }

                if (!nextImport)
                {
                    return match;
                }

                return `import ${definitions} from "${nextImport.replace(/\\/g, "/")}"`;
            });

            await fs.mkdir(outputFolder, { recursive: true });
            await fs.writeFile(path.join(outputFolder, fileName), converted);
        });
}

module.exports.scriptMain = scriptMain;