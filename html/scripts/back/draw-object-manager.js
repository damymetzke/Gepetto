//todo: refactor the spaghhett

const { ipcMain } = require("electron");
const fs = require("fs");
const xml = require("xml2js");

const { DrawObjectTree, DrawObject } = require("../core/draw-object-tree");
const Transform = require("../core/transform");
const { TransformCommand } = require("../core/transform-command");

let ResourceDirectory = "./saved";
let window = null;

let objectTree = new DrawObjectTree();
let activeObject = null;

function AddDrawObject(object)
{
    objectTree.AddObjectToRoot(object);
    window.webContents.send("refresh-text-tree", objectTree);
}

function OnAddTransformCommand(event, command)
{
    if (activeObject === null)
    {
        return;
    }
    activeObject.AddTransformCommand(command);
    activeObject.OnTransformCommandsUpdate();

    window.webContents.send("refresh-selected-object", activeObject);
}

function OnUpdateObject(event, updateValues)
{
    if (activeObject === null)
    {
        return;
    }

    if ("name" in updateValues)
    {
        objectTree.objects[updateValues.name] = activeObject;
        delete objectTree.objects[activeObject.name];
    }

    if ("transformCommands" in updateValues)
    {
        activeObject.OnTransformCommandsUpdate();
    }

    activeObject = Object.assign(activeObject, updateValues);
    window.webContents.send("refresh-text-tree", objectTree);
    window.webContents.send("refresh-selected-object", activeObject);
}

function OnSelectObject(event, name)
{
    activeObject = (name in objectTree.objects) ? objectTree.objects[name] : null;
    window.webContents.send("refresh-selected-object", activeObject);
}

function OnImportSvg(event, importArguments)
{
    let parsingFailed = false;
    let parsingError = "";

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

    xml.parseString(fs.readFileSync(importArguments.filePath, "utf-8"), { async: false }, function (error, content)
    {
        if (error)
        {
            parsingFailed = true;
            parsingError = error;
            return;
        }

        let innerContent = content.svg;
        if (innerContent === undefined || innerContent === null)
        {
            parsingFailed = true;
            parsingError = "xml file is not properly formatted for svg";
            return;
        }

        delete innerContent["$"];
        innerContent = { g: innerContent };
        let builder = new xml.Builder({ headless: true });
        let result;
        try
        {
            result = builder.buildObject(innerContent);
        }
        catch (error)
        {
            parsingFailed = true;
            parsingError = "error when rebuilding svg content<br>" + error;
            return;
        }

        if (!fs.existsSync(ResourceDirectory))
        {
            fs.mkdirSync(ResourceDirectory);
        }
        fs.writeFileSync(`${ResourceDirectory}/${importArguments.name}.xml`, result);

        AddDrawObject(new DrawObject(importArguments.name));
    });

    if (parsingFailed)
    {
        return {
            success: false,
            message: "XML parsing failed with error:<br>" + parsingError
        };
    }

    return {
        success: true
    };
}

function Init(mainWindow)
{
    window = mainWindow;
    ipcMain.handle("import-svg", OnImportSvg);
    ipcMain.handle("select-object", OnSelectObject);
    ipcMain.handle("update-object", OnUpdateObject);
    ipcMain.handle("add-transform-command", OnAddTransformCommand);
}

module.exports.Init = Init;