import {SyncConnector, SyncMessage} from "../core/core";

const {ipcRenderer} = require("electron");

export class SyncConnectorFront implements SyncConnector {

    callback: (message: SyncMessage) => void;

    ipcChannel: string;

    send (message: SyncMessage): void {

        ipcRenderer.send(this.ipcChannel, message);

    }

    onRecieve (callback: (message: SyncMessage) => void): void {

        this.callback = callback;

    }

    onDestroy (): void {

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
