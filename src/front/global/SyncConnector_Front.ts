import {SyncConnector, SyncMessage} from "../core/core";

const {ipcRenderer} = require("electron");

export class SyncConnectorFront implements SyncConnector {

    callback: (message: SyncMessage) => void;

    ipcChannel: string;

    send (message: SyncMessage) {

        ipcRenderer.send(this.ipcChannel, message);

    }

    onRecieve (callback: (message: SyncMessage) => void) {

        this.callback = callback;

    }

    onDestroy () {

        ipcRenderer.removeAllListeners(this.ipcChannel);

    }

    constructor (ipcChannel: string) {

        this.ipcChannel = ipcChannel;

        ipcRenderer.on(this.ipcChannel, (_event, message: SyncMessage) => {

            if (this.callback) {

                this.callback(message);

            }

        });

    }

}
