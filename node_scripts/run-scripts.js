const { exec } = require("child_process");
const Color = require("./color.js");

const COLOR_OUTPUT_HEADER = [Color.EFFECTS["BG_BRIGHT_MAGENTA"], Color.EFFECTS["FG_BLACK"]];

function RunNpmScript(script)
{
    const scriptName = script.toUpperCase().replace(":", "_");
    return new Promise((resolve, reject) =>
    {
        exec(`npm run ${script}`, (_error, stdout, _stderr) =>
        {
            resolve(`(head){${scriptName}_OUTPUT_START}` +
                `${stdout}` +
                `(head){${scriptName}_OUTPUT_END}`);
        });
    });
}

function Run()
{
    if (process.argv.length < 3)
    {
        Color.Log("⚠ run-scripts.js called with no arguments,\nterminating program with no actions taken.", Color.WARN);
        return;
    }

    const scriptArguments = process.argv.slice(2);

    Color.Log(`(head){Running npm scripts:}${scriptArguments.reduce((accumelator, script) => { return `${accumelator}\n*  (script){${script}}`; }, "")}`, [], {
        head: Color.HEADER,
        script: Color.FILE
    });

    const promises = scriptArguments.reduce((accumenlator, script) => [...accumenlator, RunNpmScript(script)], []);

    Promise.all(promises).then(values =>
    {
        Color.Log(values.reduce((accumelator, out) => `${accumelator}${out}\n\n`, ""), [], {
            head: COLOR_OUTPUT_HEADER
        });
    });
}

Run();