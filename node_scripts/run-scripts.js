const { exec } = require("child_process");
const Color = require("./color.js");

const COLOR_OUTPUT_HEADER = [Color.EFFECTS["BG_BRIGHT_MAGENTA"], Color.EFFECTS["FG_BLACK"]];

function RunNpmScript(script)
{
    const scriptName = script.toUpperCase().replace(":", "_");
    exec(`npm run ${script}`, (_error, stdout, _stderr) =>
    {
        Color.Log(`(head){${scriptName}_OUTPUT_START}
${stdout}
(head){${scriptName}_OUTPUT_END}`, [], {
            head: COLOR_OUTPUT_HEADER
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

    scriptArguments.forEach(script => RunNpmScript(script));
}

Run();