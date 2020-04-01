//nodejs imports
const { ipcMain } = require("electron");
const fs = require("fs");

const { DrawObjectTree, DrawObject } = require("../core/core");

const { SvgToObjectXml, ReadObjectXml } = require("./draw-object-xmlhandler");

//file variables//
//////////////////
let ResourceDirectory = "./saved/objects";
let window = null;


//draw objects//
////////////////
let objectTree = new DrawObjectTree();
let activeObject = null;

function AddDrawObject(object)
{
    objectTree.AddObjectToRoot(object);
    window.webContents.send("refresh-text-tree", objectTree);
}

//ipc main//
////////////
function OnImportSvg(event, importArguments)
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
        fileContent = fs.readFileSync(importArguments.filePath, "utf-8");
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
    AddDrawObject(new DrawObject(importArguments.name));

    return {
        success: true
    };
}


function OnSelectObject(event, name)
{
    activeObject = (name in objectTree.objects) ? objectTree.objects[name] : null;
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

function SetupIpcMain()
{
    ipcMain.handle("import-svg", OnImportSvg);
    ipcMain.handle("select-object", OnSelectObject);
    ipcMain.handle("update-object", OnUpdateObject);
    ipcMain.handle("add-transform-command", OnAddTransformCommand);
}

function Init(mainWindow)
{
    window = mainWindow;
    SetupIpcMain();
}

module.exports.Init = Init;