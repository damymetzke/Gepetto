import { SyncConnector, SyncMessageAlt } from "./core/core";

import { ipcMain, BrowserWindow } from "electron";

export class SyncConnector_Back implements SyncConnector
{
    callback: (message: SyncMessageAlt) => void;
    ipcChannel: string;
    targetWindow: BrowserWindow;

    send(message: SyncMessageAlt)
    {
        this.targetWindow.webContents.send(this.ipcChannel, message);
    };
    onRecieve(callback: (message: SyncMessageAlt) => void)
    {
        this.callback = callback;
    }

    constructor (ipcChannel: string, targetWindow: BrowserWindow)
    {
        this.ipcChannel = ipcChannel;
        this.targetWindow = targetWindow;

        ipcMain.on(this.ipcChannel, (_event, message: SyncMessageAlt) =>
        {
            if (this.callback)
            {
                this.callback(message);
            }
        });
    }

}