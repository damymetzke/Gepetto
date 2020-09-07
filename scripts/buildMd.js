const { promises: fs } = require("fs");
const path = require("path");
const marked = require("marked");
const _ = require("lodash");

const REGEX_MARKDOWN_EXTENSION = /^([^]+)\.md$/i;

function wrapHtml(title, body)
{
    return (
        "<!doctype html>\n"
        + "<html lang=\"en\">\n"
        + "<head>\n"
        + "<link rel=\"stylesheet\" href=\"./style/style.css\">\n"
        + `<title>${title}</title>\n`
        + "</head>\n"
        + "<body>\n"
        + `${body}\n`
        + "</body>\n"
        + "</html>"
    );
}

async function walk(sourceDirectory, outDirectory)
{
    const files = await fs.readdir(sourceDirectory);

    await fs.mkdir(outDirectory, { recursive: true });

    const fileResults = await Promise.all(files.map(async file =>
    {
        const filePath = path.join(sourceDirectory, file);
        const fileStat = await fs.stat(filePath);
        if (fileStat.isDirectory())
        {
            const newOutDir = path.join(outDirectory, file);
            return walk(filePath, newOutDir);
        }

        const rawInput = await fs.readFile(filePath);
        const converted = marked(rawInput.toString());
        const output = wrapHtml(
            file.replace(REGEX_MARKDOWN_EXTENSION, (_match, title) => title),
            converted
        );
        const outFile = path.join(outDirectory, file.replace(REGEX_MARKDOWN_EXTENSION, (_match, title) => `${title}.html`));
        await fs.writeFile(outFile, output);
        return 1;
    }));

    return _.sum(fileResults);
}

async function scriptMain(sourceDirectory, outDirectory)
{
    const filesCopied = walk(sourceDirectory, outDirectory);
    return {
        filesCopied: filesCopied
    };
}

module.exports.scriptMain = scriptMain;