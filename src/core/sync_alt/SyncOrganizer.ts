import { SyncConnector } from "./SyncConnector.js";

export type SyncAction = { action: string, argumentList: any[]; };

export enum SyncOrganizerType
{
    NONE = 0,
    OWNER,
    SUBSCRIBER
}

export interface SyncOrganizer
{
    send: (action: SyncAction) => void;
    onRecieve: (callback: (action: SyncAction) => void) => void;

    getFullSyncData: (callback: () => any) => void;
    onFullSync: (callback: (data: any) => void) => void;

    requestSync: () => void;
}

export class SyncOrganizer_Owner implements SyncOrganizer
{
    connector: SyncConnector;
    readyToRecieve: boolean;

    callback: (action: SyncAction) => void;

    getFullSyncCallback: () => any;

    send(action: SyncAction)
    {
        this.connector.send({
            type: "action",
            action: action.action,
            argumentList: action.argumentList,
            num: 0
        });

        this.callback(action);
    }
    onRecieve(callback: (action: SyncAction) => void)
    {
        this.callback = callback;
    }

    getFullSyncData(callback: () => any)
    {
        this.getFullSyncCallback = callback;
    }
    onFullSync(callback: (data: any) => void)
    {
    }

    requestSync()
    {

    }

    constructor (connector: SyncConnector)
    {
        this.connector = connector;
        this.readyToRecieve = false;
        this.connector.onRecieve((message) =>
        {
            switch (message.type)
            {
                case "action":
                    if (!this.readyToRecieve)
                    {
                        break;
                    }
                    this.connector.send({
                        type: "confirm",
                        num: message.num
                    });
                    this.callback({ action: message.action, argumentList: message.argumentList });

                    break;

                case "request-sync":
                    this.readyToRecieve = false;
                    this.connector.send({
                        type: "sync",
                        object: this.getFullSyncCallback()
                    });
                    break;

                case "start":
                    this.readyToRecieve = true;
                    this.connector.send({
                        type: "confirm",
                        num: message.num
                    });
            }
        });
    }
}

export class SyncOrganizer_Subscriber implements SyncOrganizer
{
    connector: SyncConnector;

    numSend: number;
    numConfirmed: number;

    waitForSync: boolean;
    queuedActions: SyncAction[];

    callback: (action: SyncAction) => void;

    fullSyncCallback: (data: any) => void;

    send(action: SyncAction)
    {
        //queue action if we are currently syncing
        if (this.waitForSync)
        {
            this.queuedActions.push();
            return;
        }
        this.connector.send({
            type: "action",
            action: action.action,
            argumentList: action.argumentList,
            num: ++(this.numSend)
        });

        this.callback(action);
    }
    onRecieve(callback: (action: SyncAction) => void)
    {
        this.callback = callback;
    }

    getFullSyncData(_callback: () => any)
    {
    }
    onFullSync(callback: (data: any) => void)
    {
        this.fullSyncCallback = callback;
    }

    requestSync()
    {
        this.connector.send({
            type: "request-sync"
        });
    }

    constructor (connector: SyncConnector)
    {
        this.numSend = 0;
        this.numConfirmed = 0;
        this.waitForSync = false;
        this.connector = connector;
        this.queuedActions = [];

        this.connector.onRecieve((message) =>
        {
            switch (message.type)
            {
                case "action":
                    if (this.numSend !== this.numConfirmed)
                    {
                        this.connector.send({
                            type: "request-sync"
                        });
                        break;
                    }
                    this.callback({ action: message.action, argumentList: message.argumentList });
                    break;

                case "confirm":
                    this.numConfirmed = Math.max(message.num, this.numConfirmed);
                    break;

                case "sync":
                    this.fullSyncCallback(message.object);
                    this.connector.send({
                        type: "start",
                        num: ++(this.numSend)
                    });
                    this.queuedActions.forEach(action =>
                    {
                        this.connector.send({
                            type: "action",
                            action: action.action,
                            argumentList: action.argumentList,
                            num: ++(this.numSend)
                        });
                    });
                    this.queuedActions = [];
                    break;
            }
        });
    }
}