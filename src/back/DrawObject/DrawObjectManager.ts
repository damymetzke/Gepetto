import { DrawObjectTreeEditorWrapper, SyncOrganizerType, DrawObject } from "../core/core";

import { SyncConnector_Back } from "../SyncConnector_Back";
import { BrowserWindow, ipcMain } from "electron";
import * as fs from "fs";
import { SvgToObjectXml } from "../draw-object-xmlhandler";
import { convertSvg } from "../Svg/SvgConverter";

const REGEX_VALIDATE_IMPORT_NAME = /^[a-z][a-z0-9_#]*$/i;

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

    onImportSvg(importData: SvgImportData): ImportResult | Promise<ImportResult>
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

        return convertSvg({
            sourcePath: importData.filePath,
            name: importData.name,
            subObjects: [
                "0.0.0",
                "0.0.1",
                "0.1"
            ]
        })
            .then((names) =>
            {
                names.forEach(name =>
                {
                    //success, add draw object
                    this.drawObjectTree.AddObjectToRoot(new DrawObject(name));
                });
                return <ImportResult>{
                    success: true
                };
            })
            .catch(error =>
            {
                return <ImportResult>{
                    success: false,
                    message: error
                };
            });


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