import {SyncConnector, SyncMessage} from "./SyncConnector";

/**
 * implementation of {@linkcode syncConnector}
 * which connects 2 objects in the same memory space.
 * 
 * this implementation has no real world utility,
 * given that you could just reference the original object.
 * so this function only has real use for debugging.
 */
export class SyncConnectorDirect implements SyncConnector {

    other: SyncConnectorDirect;

    callback: (message: SyncMessage) => void;

    send (message: SyncMessage) {

        this.other.callback(message);

    }

    onRecieve (callback: (message: SyncMessage) => void) {

        this.callback = callback;

    }

    constructor (other: SyncConnectorDirect = null) {

        if (other) {

            this.other = other;
            other.other = this;

        }

    }

}
