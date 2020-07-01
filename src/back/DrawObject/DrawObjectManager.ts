import { DrawObjectTreeWrapper, SyncOrganizerType, DrawObject } from "../core/core";

import { SyncConnector_Back } from "../SyncConnector_Back";
import { BrowserWindow, ipcMain } from "electron";

interface SvgImportData
{
    name: string;
    filePath: string;
}

export class DrawObjectManager
{
    drawObjectTree: DrawObjectTreeWrapper;

    onImportSvg(importData: SvgImportData)
    {
        this.drawObjectTree.AddObjectToRoot(new DrawObject(importData.name));
    }

    constructor (window: BrowserWindow)
    {
        this.drawObjectTree = new DrawObjectTreeWrapper(SyncOrganizerType.OWNER, new SyncConnector_Back("draw-object-tree", window));


        ipcMain.handle("import-svg", (_event, importData: SvgImportData) =>
        {
            this.onImportSvg(importData);
        });
    }
}