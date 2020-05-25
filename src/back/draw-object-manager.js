//nodejs imports
const { ipcMain } = require("electron");
const fs = require("fs");

const { DrawObjectTree, DrawObject, TransformCommand } = require("./core/core");

const { SvgToObjectXml, ReadObjectXml } = require("./draw-object-xmlhandler");

const svgManager = require("./svg-manager");

//file variables//
//////////////////
let ResourceDirectory = "./saved/objects";
let window = null;


//draw objects//
////////////////
let objectTree = new DrawObjectTree();
let activeObject = null;
let selectedTransformCommandIndex = -1;

function AddDrawObject(object)
{
    objectTree.AddObjectToRoot(object);
    window.webContents.send("refresh-objects", {
        objectTree: objectTree.ToPureObject()
    });
}

//ipc main//
////////////
function OnImportSvg(_event, importArguments)
{
    //test for problems with the name
    if (!/^\w*$/.test(importArguments.name))
    {
        return {
            success: false,
            message: "Name can only contain alphanumerical characters and underscore('_')"
        };
    }

    if (objectTree.HasObject(importArguments.name))
    {
        return {
            success: false,
            message: "Name is already in use"
        };
    }

    //read file
    let fileContent;
    try
    {
        fileContent = fs.readFileSync(importArguments.filePath, "utf8");
    }
    catch (error)
    {
        return {
            success: false,
            message: "error opening file\n" + error
        };
    }

    //convert file
    const convertResult = SvgToObjectXml(fileContent);
    if (!convertResult.success)
    {
        return {
            success: false,
            message: "XML conversion failed:\n" + convertResult.error
        };
    }

    //write  converted file
    try
    {
        if (!fs.existsSync(ResourceDirectory))
        {
            fs.mkdirSync(ResourceDirectory);
        }
        fs.writeFileSync(`${ResourceDirectory}/${importArguments.name}.xml`, convertResult.content);
    }
    catch (error)
    {
        return {
            success: false,
            message: "error writing file\n" + error
        };
    }

    //everything succeeded, add the craw object
    const newDrawObject = new DrawObject(importArguments.name);
    AddDrawObject(newDrawObject);

    svgManager.AddSvgObject(newDrawObject.name, {
        content: ReadObjectXml(newDrawObject.name)[newDrawObject.name]
    });

    return {
        success: true
    };
}

function OnSelectObject(_event, data)
{
    if (typeof data === "string")
    {
        activeObject = (data in objectTree.objects) ? objectTree.objects[data] : null;
        selectedTransformCommandIndex = activeObject.transformCommands.length - 1;
        window.webContents.send("refresh-objects", {
            selectedObject: activeObject.ToPureObject(),
            transformCommandIndex: selectedTransformCommandIndex
        });
    }
    else
    {
        if ("name" in data)
        {
            const name = data.name;
            activeObject = (name in objectTree.objects) ? objectTree.objects[name] : null;
            selectedTransformCommandIndex = activeObject.transformCommands.length - 1;
            window.webContents.send("refresh-objects", {
                selectedObject: activeObject.ToPureObject(),
                transformCommandIndex: selectedTransformCommandIndex
            });
        }
        else
        {
            if (data.selectLastObject === true)
            {
                activeObject = objectTree.rootObjects[objectTree.rootObjects.length - 1];
                selectedTransformCommandIndex = activeObject.transformCommands.length - 1;
                window.webContents.send("refresh-objects", {
                    selectedObject: activeObject.ToPureObject(),
                    transformCommandIndex: selectedTransformCommandIndex
                });
            }
        }
    }
}

function OnReparentObject(_event, data)
{
    console.log(data);
    if (!("newParent" in data))
    {
        return;
    }

    function FindCircle(object, expected)
    {
        if (object.name === expected)
        {
            return true;
        }

        if (object.parent === null)
        {
            return false;
        }

        return FindCircle(object.parent);
    }

    if (FindCircle(objectTree.objects[data.newParent], activeObject.name))
    {
        return;
    }

    if (activeObject.parent === null)
    {
        objectTree.rootObjects.splice(objectTree.rootObjects.indexOf(activeObject), 1);
    }

    activeObject.parent = objectTree.objects[data.newParent];

    window.webContents.send("refresh-objects", {
        selectedObject: activeObject.ToPureObject(),
        objectTree: objectTree.ToPureObject()
    });
}

function OnSelectTransformCommand(_event, data)
{
    if (!("index" in data))
    {
        return;
    }

    selectedTransformCommandIndex = data.index;
    window.webContents.send("refresh-objects", {
        transformCommandIndex: selectedTransformCommandIndex
    });
}

function OnUpdateObject(_event, updateValues)
{
    if (activeObject === null)
    {
        return;
    }

    if ("name" in updateValues)
    {
        fs.rename(ResourceDirectory + "/" + activeObject.name + ".xml", ResourceDirectory + "/" + updateValues.name + ".xml", () => { });
        objectTree.objects[updateValues.name] = activeObject;
        delete objectTree.objects[activeObject.name];
    }

    activeObject = Object.assign(activeObject, updateValues);
    if ("transformCommands" in updateValues)
    {
        console.warn("⚠ transformCommands is depricated");
        for (let i = 0; i < activeObject.transformCommands.length; ++i)
        {
            let newData = activeObject.transformCommands[i];
            delete newData.matrixFunctions;
            activeObject.transformCommands[i] = Object.assign(new TransformCommand(), newData);
        }

        activeObject.OnTransformCommandsUpdate();
        svgManager.UpdateSvgObject(activeObject.name, {
            transform: activeObject.WorldTransform()
        });
    }

    if ("transformCommandUpdates" in updateValues)
    {
        for (let index in updateValues.transformCommandUpdates)
        {
            Object.assign(activeObject.transformCommands[index].fields, updateValues.transformCommandUpdates[index]);
        }

        activeObject.OnTransformCommandsUpdate();
        svgManager.UpdateSvgObject(activeObject.name, {
            transform: activeObject.WorldTransform()
        });
    }

    window.webContents.send("refresh-objects", {
        objectTree: objectTree.ToPureObject(),
        selectedObject: activeObject.ToPureObject()
    });
}

function OnUpdateTransformCommand(_event, data)
{
    if (!("fields" in data))
    {
        return;
    }

    var isRelative = ("relative" in data) ? data.relative : false;

    let fields = activeObject.transformCommands[selectedTransformCommandIndex].fields;

    for (let key in data.fields) 
    {
        if (isRelative)
        {
            switch (activeObject.transformCommands[selectedTransformCommandIndex].type)
            {
                case "TRANSLATE":
                    fields[key] = Number(fields[key]) + Number(data.fields[key]);
                    break;
                case "SCALE":
                    fields[key] = Number(fields[key]) * Number(data.fields[key]);
                    break;
                case "ROTATE":
                    fields[key] = Number(fields[key]) + Number(data.fields[key]);
                    while (fields[key] < 0)
                    {
                        fields[key] += 360;
                    }
                    while (fields[key] >= 360)
                    {
                        fields[key] -= 360;
                    }
                    break;
                default:
                    fields[key] = data.fields[key];
            }
        }
        else
        {
            fields[key] = data.fields[key];
        }
    }

    activeObject.OnTransformCommandsUpdate();
    svgManager.UpdateSvgObject(activeObject.name, {
        transform: activeObject.WorldTransform()
    });

    window.webContents.send("refresh-objects", {
        objectTree: objectTree.ToPureObject(),
        selectedObject: activeObject.ToPureObject()
    });
}

function OnAddTransformCommand(_event, command)
{
    delete command["matrixFunctions"];
    if (activeObject === null)
    {
        return;
    }
    if (!("type" in command))
    {
        return;
    }
    activeObject.AddTransformCommand(new TransformCommand(command.type));
    activeObject.OnTransformCommandsUpdate();

    selectedTransformCommandIndex = activeObject.transformCommands.length - 1;

    window.webContents.send("refresh-objects", {
        selectedObject: activeObject.ToPureObject(),
        transformCommandIndex: selectedTransformCommandIndex
    });
    svgManager.UpdateSvgObject(activeObject.name, {
        transform: activeObject.WorldTransform()
    });
}

function OnAddTransformCommandAlt(event, data)
{
    OnAddTransformCommand(event, data.command);
}

function OnRetrieveGhost()
{
    return {
        transformCommands: activeObject.ToPureObject(),
        name: activeObject.name,
        transformCommandIndex: selectedTransformCommandIndex
    };
}

function SetupIpcMain()
{
    ipcMain.handle("import-svg", OnImportSvg);
    ipcMain.handle("select-object", OnSelectObject);
    ipcMain.handle("reparent-object", OnReparentObject);
    ipcMain.handle("select-transform-command", OnSelectTransformCommand);
    ipcMain.handle("update-object", OnUpdateObject);
    ipcMain.handle("update-transform-command", OnUpdateTransformCommand);
    ipcMain.handle("add-transform-command", OnAddTransformCommand);
    ipcMain.handle("add-transform-command-alt", OnAddTransformCommandAlt);
    ipcMain.handle("retrieve-ghost", OnRetrieveGhost);
}

function Init(mainWindow)
{
    window = mainWindow;
    SetupIpcMain();
    svgManager.Init(window);
}

module.exports.Init = Init;