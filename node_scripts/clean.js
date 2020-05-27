const Color = require("./color.js");
const del = require("del");
const fs = require("fs");

const CONFIG_PATH = "./config/build.config.json";
const CONFIG_DATA = JSON.parse(fs.readFileSync(CONFIG_PATH));

if (!("cleanDirectories" in CONFIG_DATA))
{
    Color.Error(
        `key 'cleanDirectories' not found in config file (file){'${CONFIG_PATH}'}\n`
        + `read config data:\n\t${
        JSON.stringify(CONFIG_DATA, null, 2).replace(/\n/g, "\n\t")
        }`);
}

Color.Log(`(head){Cleaning Directories:}
${CONFIG_DATA.cleanDirectories.reduce((accumelator, directory) => `${accumelator}* (file){"${directory}"}\n`, "")}`, [], {
    head: Color.HEADER,
    file: Color.FILE
});

CONFIG_DATA.cleanDirectories.forEach(directory =>
{
    del(directory).catch((error) =>
    {
        Color.Log(`error loading directory: (file){"${directory}"}\n(error){${error}}`, [], {
            file: Color.FILE,
            error: Color.ERROR
        });
    });
});