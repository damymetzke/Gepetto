const { SynchronizedTree } = require("electron").remote.require("../core/sync/synchronized-tree");
const { ipcRenderer } = require("electron");

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