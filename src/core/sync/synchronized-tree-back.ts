import { SynchronizedTree, SyncData, SyncMessage } from "./synchronized-tree";

import { BrowserWindow } from "electron";

export class SynchronizedTreeBack extends SynchronizedTree
{
    _window: BrowserWindow;
    _channel: string;

    SendAction(action: string, data: SyncData)
    {
        if (!this._window)
        {
            console.error("❗ SynchronizedTreeBack.SendAction was called, but _window does not exist. Make sure to properly initialize SynchronizedTreeBack when using it.");
            return;
        }

        this._window.webContents.send(this._channel, {
            action: action,
            data: data
        });
    }

    constructor(window: BrowserWindow, channel: string)
    {
        super();

        this._window = window;
        this._channel = channel;
    }
}