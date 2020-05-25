const { ipcRenderer } = require("electron");

import { SynchronizedTree, SyncData } from "../core/sync/synchronized-tree";

export class SynchronizedTreeFront extends SynchronizedTree
{
    _channel: string;

    SendAction(action: string, data: SyncData)
    {
        ipcRenderer.invoke(this._channel, action, data);
    }

    constructor(channel: string)
    {
        super();

        ipcRenderer.on(channel, (_event, action, data) =>
        {
            this.RecieveAction(action, data);
        });
    }
}