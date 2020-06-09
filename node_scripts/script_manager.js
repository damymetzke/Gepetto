const Color = require("./color");
const fs = require("fs");

const SCRIPTMAP_PATH = "./config/scriptmap.json";
const SCRIPTMAP = JSON.parse(fs.readFileSync(SCRIPTMAP_PATH));

function DisplayScripts(displayAll, displaySubScripts, displayDependencies)
{
    Color.Log("\n");
    const exported = new Set(SCRIPTMAP.export);
    for (const script in SCRIPTMAP.scripts)
    {
        const currentScript = SCRIPTMAP.scripts[script];
        const isExported = exported.has(script);
        if (!isExported && !displayAll)
        {
            continue;
        }
        const scriptDisplayName = isExported ? script : `~${script}`;
        Color.Log("\n");
        Color.Log(scriptDisplayName);

        if (displaySubScripts && "subscripts" in currentScript)
        {
            Color.Log("  subscripts: [");
            currentScript.subscripts.forEach(subScript =>
            {
                Color.Log(
                    "    {\n"
                    + `      type: ${subScript.type}`
                );

                switch (subScript.type)
                {
                    case "script":
                        Color.Log(`      script: ${subScript.script}`);
                        break;

                    case "shell":
                        Color.Log(`      program: ${subScript.program}`);
                        if ("arguments" in subScript)
                        {
                            Color.Log("      arguments:[");

                            subScript.arguments.forEach(argument =>
                            {
                                Color.Log(`        ${argument}`);
                            });

                            Color.Log("      ]");
                        }
                        break;

                    case "node":
                        Color.Log(`      file: ${subScript.file}`);
                        if ("arguments" in subScript)
                        {
                            Color.Log("      arguments:[");

                            subScript.arguments.forEach(argument =>
                            {
                                Color.Log(`        ${argument}`);
                            });

                            Color.Log("      ]");
                        }
                }

                Color.Log("    }");
            });

            Color.Log("  ]");
        }

        if (displayDependencies && "dependencies" in currentScript)
        {
            Color.Log("  dependencies: [");

            currentScript.dependencies.forEach(dependency =>
            {
                Color.Log(`    ${dependency}`);
            });

            Color.Log("  ]");
        }
    }
}
DisplayScripts(false, true, true);