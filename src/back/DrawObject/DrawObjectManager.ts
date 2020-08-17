import { DrawObjectTreeEditorWrapper, SyncOrganizerType, DrawObject } from "../core/core";

import { SyncConnector_Back } from "../SyncConnector_Back";
import { BrowserWindow, ipcMain } from "electron";
import * as fs from "fs";
import { SvgToObjectXml } from "../draw-object-xmlhandler";
import { convertSvg } from "../Svg/SvgConverter";

const REGEX_VALIDATE_IMPORT_NAME = /^[a-z][a-z0-9_]*$/i;

interface SvgImportData
{
    name: string;
    filePath: string;
}

type ImportResult =
    {
        success: true;
    }
    |
    {
        success: false;
        message: string;
    };

export class DrawObjectManager
{
    drawObjectTree: DrawObjectTreeEditorWrapper;
    resourceDirectory: string;

    onImportSvg(importData: SvgImportData): ImportResult
    {
        //validate file name
        if (!REGEX_VALIDATE_IMPORT_NAME.test(importData.name))
        {
            return {
                success: false,
                message: "Name can only contain alphanumerical characters and underscore('_')\nName should always start with an alphabetic character ('a'-'z')"
            };
        }

        if (this.drawObjectTree.HasObject(importData.name))
        {
            return {
                success: false,
                message: "Name is already in use"
            };
        }

        //tmp
        convertSvg({
            sourcePath: importData.filePath,
            name: importData.name,
            subObjects: []
        });
        //endtmp

        //read file content
        let fileContent;
        try
        {
            fileContent = fs.readFileSync(importData.filePath, "utf8");
        }
        catch (error)
        {
            return {
                success: false,
                message: `Error reading file:\n${error}`
            };
        }

        //convert file content
        const convertedContent: ({ success: true; content: string; } | { success: false; error: string; }) = <any>SvgToObjectXml(fileContent);
        if (!convertedContent.success)
        {
            return {
                success: false,
                message: `XML conversion failed with error:\n'${(<any>convertedContent).error}'`
            };
        }

        //write converted content
        try
        {
            if (!fs.existsSync(this.resourceDirectory))
            {
                fs.mkdirSync(this.resourceDirectory);
            }
            fs.writeFileSync(`${this.resourceDirectory}/${importData.name}.xml`, convertedContent.content);
        }
        catch (error)
        {
            return {
                success: false,
                message: `Error writing file:\n'${error}'`
            };
        }

        //success, add draw object
        this.drawObjectTree.AddObjectToRoot(new DrawObject(importData.name));

        return {
            success: true
        };
    }

    constructor (window: BrowserWindow)
    {
        this.drawObjectTree = new DrawObjectTreeEditorWrapper(SyncOrganizerType.OWNER, new SyncConnector_Back("draw-object-tree", window));


        ipcMain.handle("import-svg", (_event, importData: SvgImportData) =>
        {
            return this.onImportSvg(importData);
        });

        this.resourceDirectory = "./saved/objects";
    }
}