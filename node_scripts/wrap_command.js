const fs = require("fs");
const { exec } = require("child_process");

const { Parse } = require("./parse-arguments");
const Color = require("./color");

const REGEX_SPECIAL_ARGUMENT = /{(build_config):([^]*)}/g;

const CONFIG_PATH = "./config/build.config.json";
const CONFIG = JSON.parse(fs.readFileSync(CONFIG_PATH));

const arguments = Parse(process.argv.slice(2));

if (arguments.positional.length < 1)
{
    Color.Error("too few positional arguments!\nexpected 1 positional argument");
    return;
}

const SPECIAL_ARGUMENT_FUNCTION = {
    "build_config": (text) =>
    {
        const keys = text.split(".");
        const result = keys.reduce((accumelator, key) =>
        {
            return (key in accumelator) ? accumelator[key] : null;
        }, CONFIG);
        return result;
    }
};

const converted = arguments.positional[0].replace(REGEX_SPECIAL_ARGUMENT, (_match, type, text) =>
{
    return SPECIAL_ARGUMENT_FUNCTION[type](text);
});

exec(converted, (_error, stdout, stderr) =>
{
    if (stdout)
    {
        Color.Log(stdout);
    }

    if (stderr)
    {
        Color.Warn(stderr);
    }
});