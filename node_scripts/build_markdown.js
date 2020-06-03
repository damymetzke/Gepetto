const fs = require("fs");
const path = require("path");
const marked = require("marked");
const Color = require("./color");
const Walk = require("./walk-directories");

const REGEX_ALL = /[^]*/;
const REGEX_MARKDOWN_TO_HTML_EXTENSION = /^([^]+)\.md$/i;

const CONFIG_PATH = "./config/build.config.json";
const CONFIG = JSON.parse(fs.readFileSync(CONFIG_PATH));

function WrapHtml(body, title)
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

if (!("directoryMaps" in CONFIG))
{
    Color.Error(`No key 'directoryMaps' in config file (file){'${CONFIG_PATH}'}`);
    return;
}

if (!("markdown" in CONFIG.directoryMaps))
{
    Color.Error(`No key 'directoryMaps.markdown' in config file (file){'${CONFIG_PATH}'}`);
    return;
}

CONFIG.directoryMaps.markdown.forEach(mapping =>
{
    const { from, to } = mapping;
    const test = ("test" in mapping) ? new RegExp(mapping.test) : REGEX_ALL;

    Walk(from, "", test, (data, relative, file) =>
    {
        const markdownOutput = WrapHtml(marked(data.toString()), file.replace(REGEX_MARKDOWN_TO_HTML_EXTENSION, (_match, name) => name));
        const outputPath = path.join(to, relative, file.replace(REGEX_MARKDOWN_TO_HTML_EXTENSION, (_match, name) => `${name}.html`));
        const outputDir = path.join(to, relative);
        if (!fs.existsSync(outputDir))
        {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        fs.writeFile(outputPath, markdownOutput, (error) =>
        {
            if (error)
            {
                Color.Warn(`Error writing to file (file){'${outputPath}'}:\n${error}`);
            }
        });
    });
});