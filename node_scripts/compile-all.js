const { exec } = require("child_process");
const Color = require("./color.js");

const COLOR_OUTPUT_HEADER = [Color.EFFECTS["BG_BRIGHT_MAGENTA"], Color.EFFECTS["FG_BLACK"]];

const scriptList = [
    "compile:html",
    "compile:typescript",
    "compile:sass"
];

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

Color.Log(`(head){Compiling scripts:}${scriptList.reduce((accumelator, script) => { return `${accumelator}\n*  (script){${script}}`; }, "")}`, [], {
    head: Color.HEADER,
    script: Color.FILE
});

scriptList.forEach((script) =>
{
    RunNpmScript(script);
});