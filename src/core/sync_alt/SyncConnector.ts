/**
 * message that will be send between sync objects using connectors.
 * 
 * There are 4 message types:
 * 
 * - `start`; should be the first message after initialization, or a resync.
 * - `action`; directly corresponds to a function call. The other synced object should run this function whenever it recieves an action message.
 * - `confirm`; confirm the ordinal position of a specific message, used to avoid data race conditions.
 * - `request-sync`; request a full sync, usually send whenever there is a reason to expect the objects are out of sync.
 * - `sync`; send an object representing the entire object and force a full reset to a synchronized state. Any extra actions recieved after sending this will be discarded until `start` is send.
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

export interface SyncConnector
{
    send: (message: SyncMessage) => void;
    onRecieve: (callback: (message: SyncMessage) => void) => void;
}

export class SyncConnector_Null implements SyncConnector
{
    send(message: SyncMessage)
    {

    };
    onRecieve(callback: (message: SyncMessage) => void)
    {

    };
}

export class SyncConnector_Direct implements SyncConnector
{
    other: SyncConnector_Direct;

    callback: (message: SyncMessage) => void;

    send(message: SyncMessage)
    {
        this.other.callback(message);
    };
    onRecieve(callback: (message: SyncMessage) => void)
    {
        this.callback = callback;
    };

    constructor (other: SyncConnector_Direct = null)
    {
        if (other)
        {
            this.other = other;
            other.other = this;
        }
    }
}