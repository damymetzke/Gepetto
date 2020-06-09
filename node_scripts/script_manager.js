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

function Verify()
{
    if (!("scripts" in SCRIPTMAP))
    {
        Color.Error("No 'scripts' key found in scriptmap\nat least 1 script should be defined\n");
    }

    if (Object.keys(SCRIPTMAP.scripts).length === 0)
    {
        Color.Error("'scripts' in scriptmap is empty\nat least 1 script should be defined\n");
    }

    //test if all exported scripts exist
    if (!("export" in SCRIPTMAP))
    {
        Color.Error("No 'export' key found in scriptmap\nat least 1 script should be exported\n");
    }
    else if (SCRIPTMAP.export.length === 0)
    {
        Color.Error("'export' in scriptmap is empty\nat least 1 script should be exported\n");
    }
    else
    {
        SCRIPTMAP.export.forEach(exported =>
        {
            if (exported in SCRIPTMAP.scripts)
            {
                return;
            }
            Color.Error(`exported script '${exported}' does not exist\n`);
        });
    }

    //test if all scripts are valid
    for (const scriptName in SCRIPTMAP.scripts)
    {
        const script = SCRIPTMAP.scripts[scriptName];
        if (!("subscripts" in script) && !("dependencies" in script))
        {
            Color.Error(`script '${scriptName}' has no subscripts or dependencies\ncurrently this script will have not effect\n`);
        }

        if ("dependencies" in script)
        {
            if (script.dependencies.length === 0)
            {
                Color.Warn(`dependencies of '${scriptName}' is empty\n`);
            }
            else
            {
                script.dependencies.forEach(dependency =>
                {
                    if (dependency in SCRIPTMAP.scripts)
                    {
                        return;
                    }

                    Color.Error(`dependency '${dependency}' in script '${scriptName}' does not exist\n`);
                });
            }
        }

        if ("subscripts" in script)
        {
            if (script.subscripts.length === 0)
            {
                Color.Warn(`subscripts of '${scriptName}' is empty\n`);
            }
            else
            {
                script.subscripts.forEach((subscript, index) =>
                {
                    if (!("type" in subscript))
                    {
                        Color.Error(`* {{ scripts.${scriptName}.subscripts[${index}] }} has no type\n`);
                        return;
                    }

                    switch (subscript.type)
                    {
                        case "script":
                            if (!("script" in subscript))
                            {
                                Color.Error(`* {{ scripts.${scriptName}.subscripts[${index}] }} is of type 'script' but has no script value defined\n`);
                                break;
                            }

                            if (!(subscript.script in SCRIPTMAP.scripts))
                            {
                                Color.Error(`* {{ scripts.${scriptName}.subscripts[${index}].script }} script '${subscript.script}' does not exist\n'`);
                            }
                            break;

                        case "shell":
                            if (!("program" in subscript))
                            {
                                Color.Error(`* {{ scripts.${scriptName}.subscripts[${index}] }} is of type 'shell', but has no program value defined\n`);
                            }
                            break;

                        case "node":
                            if (!("file" in subscript))
                            {
                                Color.Error(`* {{ scripts.${scriptName}.subscripts[${index}] }} is of type 'node', but has no file value defined\n`);
                            }

                            break;

                        default:
                            Color.Error(`* {{ scripts.${scriptName}.subscripts[${index}] }} has an unrecognised type of '${subscript.type}'\n`);
                    }
                });
            }
        }
    }

    return result;

}
Verify();