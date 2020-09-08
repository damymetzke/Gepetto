const sass = require("node-sass");
const { promises: fs } = require("fs");
const path = require("path");
const { promisify } = require("util");

const _ = require("lodash");

const renderSass = promisify(sass.render);

const REGEX_ROOT_SASS_FILE = /^([a-z][a-z0-9_-]*)\.scss$/i;

async function walk(sourceDirectory, outDirectory)
{
    const files = await fs.readdir(sourceDirectory);

    const fileResults = await Promise.all(files.map(async file =>
    {
        const filePath = path.join(sourceDirectory, file);
        const fileStat = await fs.stat(filePath);
        if (fileStat.isDirectory())
        {
            return walk(filePath, outDirectory);
        }

        if (!REGEX_ROOT_SASS_FILE.test(file))
        {
            return 0;
        }

        const rendered = await renderSass({
            file: filePath,
            includePaths: [
                path.join(sourceDirectory)
            ]
        });

        const outFile = path.join(outDirectory, file.replace(REGEX_ROOT_SASS_FILE, (_match, name) => `${name}.css`));
        const outMapFile = path.join(outDirectory, file.replace(REGEX_ROOT_SASS_FILE, (_match, name) => `${name}.map.css`));
        await Promise.all([
            fs.writeFile(outFile, rendered.css),
            fs.writeFile(outMapFile, rendered.map)
        ]);

        return 1;
    }));

    return _.sum(fileResults);
}

async function scriptMain(sourceDirectory, outDirectory)
{
    await fs.mkdir(outDirectory, { recursive: true });

    const sassRendered = await walk(sourceDirectory, outDirectory);

    return {
        sassRendered: sassRendered
    };
}

module.exports.scriptMain = scriptMain;