const { exec } = require("child_process");
const Color = require("./color.js");

const COLOR_OUTPUT_HEADER = [Color.EFFECTS["BG_BRIGHT_MAGENTA"], Color.EFFECTS["FG_BLACK"]];

function RunNpmScript(script)
{
    const scriptName = script.toUpperCase().replace(":", "_");
    return new Promise((resolve, _reject) =>
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
        Color.Error("⚠ run-scripts.js called with no arguments,\nterminating program with no actions taken.");
        return;
    }

    const scriptArguments = process.argv.slice(2);

    Color.Log(`(header){Running npm scripts:}${scriptArguments.reduce((accumelator, script) =>
    {
        if (script === "then")
        {
            return `${accumelator}\nthen:\n`;
        }
        return `${accumelator}\n*  (file){${script}}`;
    }, "")}`);

    const scriptStack = scriptArguments.reduceRight((accumelator, script) =>
    {
        if (script === "then")
        {
            return [...accumelator, []];
        }

        let result = accumelator;
        result[result.length - 1].push(script);
        return result;
    }, [[]]);


    function BuildScriptStack(stack)
    {
        return new Promise((resolve, _reject) =>
        {
            const promises = stack[stack.length - 1].reduce((accumelator, script) => [...accumelator, RunNpmScript(script)], []);

            Promise.all(promises).then(values =>
            {
                if (stack.length === 1)
                {
                    resolve(values);
                    return;
                }

                BuildScriptStack(stack.slice(0, stack.length - 1)).then((recursedValues =>
                {
                    resolve([...values, ...recursedValues]);
                }));
            });
        });
    }

    BuildScriptStack(scriptStack).then(values =>
    {
        Color.Log(values.reduce((accumelator, out) => `${accumelator}${out}\n\n`, ""), [], {
            head: COLOR_OUTPUT_HEADER
        });
    });
}

Run();