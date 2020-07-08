import { SyncConnector, SyncMessageAlt } from "../core/core";

const { ipcRenderer } = require("electron");

export class SyncConnector_Front implements SyncConnector
{
    callback: (message: SyncMessageAlt) => void;
    ipcChannel: string;

    send(message: SyncMessageAlt)
    {
        ipcRenderer.send(this.ipcChannel, message);
    }
    onRecieve(callback: (message: SyncMessageAlt) => void)
    {
        this.callback = callback;
    }

    onDestroy()
    {
        ipcRenderer.removeAllListeners(this.ipcChannel);
    }

    constructor (ipcChannel: string)
    {
        this.ipcChannel = ipcChannel;

        ipcRenderer.on(this.ipcChannel, (_event, message: SyncMessageAlt) =>
        {
            if (this.callback)
            {
                this.callback(message);
            }
        });
    }

}