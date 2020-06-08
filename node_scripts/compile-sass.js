const sass = require("node-sass");
const fs = require("fs");
const path = require("path");

const Color = require("./color");
const Walk = require("./walk-directories");

const REGEX_ALL = /[^]*/;
const REGEX_SCSS_TO_CSS = /([^]+)\.scss$/i;

const CONFIG_PATH = "./config/build.config.json";
const CONFIG = JSON.parse(fs.readFileSync(CONFIG_PATH));

if (!("directoryMaps" in CONFIG))
{
    Color.Error(`No key 'directoryMaps' in config file (file){'${CONFIG_PATH}'}`);
    return;
}

if (!("sass" in CONFIG.directoryMaps))
{
    Color.Error(`No key 'directoryMaps.sass' in config file (file){'${CONFIG_PATH}'}`);
    return;
}

CONFIG.directoryMaps.sass.forEach(directoryMap =>
{
    if (!("from" in directoryMap) || !("to" in directoryMap))
    {
        Color.Warn(
            "No 'from' and/or 'to' key found in sass directory map, this will be ignored\n"
            + `Each directory map in (file){'${CONFIG_PATH}'} should have a 'from' and 'to' key\n`
            + JSON.stringify(directoryMap, null, 2)
        );
        return;
    }

    const test = ("test" in directoryMap) ? new RegExp(directoryMap.test, "i") : REGEX_ALL;
    const ignoreRelative = ("ignoreRelative" in directoryMap) ? directoryMap.ignoreRelative : false;

    Walk(directoryMap.from, "", test, (data, relative, file) =>
    {
        sass.render({
            data: data.toString(),
            includePaths: [path.join(directoryMap.from, relative)]
        }, (error, compiled) =>
        {
            if (error)
            {
                Color.Warn(`Could not compile sass:\n${error}`);
                return;
            }

            const cssFile = file.replace(REGEX_SCSS_TO_CSS, (_match, name) => `${name}.css`);
            const outputPath = ignoreRelative ? path.join(directoryMap.to, cssFile) : path.join(directoryMap.to, relative, file);

            function WriteCss(error)
            {
                if (error)
                {
                    Color.Warn(`Could not write to file (file){'${outputPath}'}\n${error}`);
                }
            }

            fs.exists(path.dirname(outputPath), (exists) =>
            {
                if (!exists)
                {
                    fs.mkdir(path.dirname(outputPath), { recursive: true }, error =>
                    {
                        if (error)
                        {
                            Color.Warn(
                                `Could not create directory (file){'${path.dirname(outputPath)}\n`
                                + "file write will be attempted anyway, if this succeeds this warning can be ignored'}\n"
                                + error);
                        }
                        fs.writeFile(outputPath, compiled.css, WriteCss);
                    });
                    return;
                }
                fs.writeFile(outputPath, compiled.css, WriteCss);
            });

        });
    });
});
