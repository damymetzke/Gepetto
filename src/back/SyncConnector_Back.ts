import { SyncConnector, SyncMessage } from "./core/core";

import { ipcMain, BrowserWindow } from "electron";

export class SyncConnector_Back implements SyncConnector
{
    callback: (message: SyncMessage) => void;
    ipcChannel: string;
    targetWindow: BrowserWindow;

    send(message: SyncMessage)
    {
        this.targetWindow.webContents.send(this.ipcChannel, message);
    };
    onRecieve(callback: (message: SyncMessage) => void)
    {
        this.callback = callback;
    }

    constructor (ipcChannel: string, targetWindow: BrowserWindow)
    {
        this.ipcChannel = ipcChannel;
        this.targetWindow = targetWindow;

        ipcMain.on(this.ipcChannel, (_event, message: SyncMessage) =>
        {
            if (this.callback)
            {
                this.callback(message);
            }
        });
    }

}