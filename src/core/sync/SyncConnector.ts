/**
 * message that will be send between sync objects using connectors.
 * 
 * There are 4 message types:
 * 
 * - `start`; should be the first message after initialization, or a resync.
 * - `action`; directly corresponds to a function call.
 * The other synced object should run this function
 * whenever it recieves an action message.
 * - `confirm`; confirm the ordinal position of a specific message,
 * used to avoid data race conditions.
 * - `request-sync`; request a full sync,
 * usually send whenever there is a reason to expect
 * the objects are out of sync.
 * - `sync`; send an object representing the entire object
 * and force a full reset to a synchronized state.
 * Any extra actions recieved after sending this
 * will be discarded until `start` is send.
 */
export type SyncMessage =
    {
        type: "start";
        num: number;
    }
    |
    {
        type: "action";
        action: string;
        argumentList: any[];
        num: number;
    }
    |
    {
        type: "confirm";
        num: number;
    }
    |
    {
        type: "request-sync";
    }
    |
    {
        type: "sync";
        object: any;
    };

/**
 * interface that acts as the bridge between 2 synchronized objects.
 * 
 * any message given through `send`
 * should be transferred to the opposing object
 * such that the `onRecieve` callback is called with the exact message.
 */
export interface SyncConnector
{
    send: (message: SyncMessage) => void;
    onRecieve: (callback: (message: SyncMessage) => void) => void;
}

/**
 * implementation of {@linkcode syncConnector} which does nothing.
 */
export class SyncConnector_Null implements SyncConnector {

    // eslint-disable-next-line max-len
    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-empty-function
    send (): void {

    }

    // eslint-disable-next-line max-len
    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-empty-function
    onRecieve (): void {

    }

}

/**
 * implementation of {@linkcode syncConnector}
 * which connects 2 objects in the same memory space.
 * 
 * this implementation has no real world utility,
 * given that you could just reference the original object.
 * so this function only has real use for debugging.
 */
export class SyncConnector_Direct implements SyncConnector {

    other: SyncConnector_Direct;

    callback: (message: SyncMessage) => void;

    send (message: SyncMessage) {

        this.other.callback(message);

    }

    onRecieve (callback: (message: SyncMessage) => void) {

        this.callback = callback;

    }

    constructor (other: SyncConnector_Direct = null) {

        if (other) {

            this.other = other;
            other.other = this;

        }

    }

}
