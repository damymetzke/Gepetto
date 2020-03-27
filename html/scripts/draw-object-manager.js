const { ipcMain } = require("electron");
const fs = require("fs");
const xml = require("xml2js");

const { DrawObjectTree, DrawObject } = require("./core/draw-object-tree");
const Transform = require("./core/transform");

let ResourceDirectory = "./saved";

let objectTree = new DrawObjectTree();

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

function Init()
{
    ipcMain.handle("import-svg", OnImportSvg);
}

module.exports.Init = Init;