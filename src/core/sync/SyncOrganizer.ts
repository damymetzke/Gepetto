import {SyncConnector} from "./SyncConnector.js";

export type SyncAction = { action: string, argumentList: unknown[]; };

/**
 * the type of organizer dictates the role it plays in synchronizing.
 * 
 * the owner is the authority of the object, the subscriber is not.
 * any full synchronization will be done from owner to subscriber,
 * so the subscriber copies the owner's object.
 * the owner will send confirmation messages
 * and the subscriber will use those to verify proper order.
 */
export enum SyncOrganizerType
{
    NONE = 0,
    OWNER,
    SUBSCRIBER
}

/**
 * interface for the object in charge of fixing errors during synchronization.
 * 
 * this object is in charge of avoiding race conditions.
 * given the potentially asychronous nature of 2 synchronized classes
 * (e.g. synchronization between 2 servers), order is important.
 * if a situation is detected where the actions are taken in a different order,
 * this class is in charge of rectifying that mistake.
 * 
 * @see https://en.wikipedia.org/wiki/Race_condition
 */
export interface SyncOrganizer
{

    /**
     * send an action to the other object.
     * 
     * this will also call `onRecieve`.
     */
    send: (action: SyncAction) => void;

    /**
     * provide a callback function for when an action is recieved.
     */
    onRecieve: (callback: (action: SyncAction) => void) => void;

    /**
     * provide a function that will be called whenever a full sync is requested.
     * 
     * this data will be send to the other object,
     * and `onFullSync` will be called using this data.
     */
    getFullSyncData: (callback: () => unknown) => void;

    /**
     * provide a callback function for when a full sync is recieved.
     * 
     * data is retrieved using `getFullSyncData` from the other object.
     */
    onFullSync: (callback: (data: unknown) => void) => void;

    /**
     * call this to request a full synchronization.
     * 
     * this will result in the other object sending its data to this object,
     * after which the `onFullSync` callback will be called.
     * 
     * @warning any actions before the sync request could be discarded.
     * any actions after the sync request, but before the sync,
     * will be queued untile the synchronization is complete.
     */
    requestSync: () => void;
}

/**
 * @see SyncOrganizerType
 */
export class SyncOrganizer_Owner implements SyncOrganizer {

    connector: SyncConnector;

    readyToRecieve: boolean;

    callback: (action: SyncAction) => void;

    getFullSyncCallback: () => unknown;

    send (action: SyncAction) {

        this.connector.send({
            type: "action",
            action: action.action,
            argumentList: action.argumentList,
            num: 0
        });

        this.callback(action);

    }

    onRecieve (callback: (action: SyncAction) => void) {

        this.callback = callback;

    }

    getFullSyncData (callback: () => unknown) {

        this.getFullSyncCallback = callback;

    }

    // eslint-disable-next-line max-len
    // eslint-disable-next-line @typescript-eslint/no-empty-function, class-methods-use-this
    onFullSync (callback: (data: unknown) => void) {
    }

    // eslint-disable-next-line max-len
    // eslint-disable-next-line @typescript-eslint/no-empty-function, class-methods-use-this
    requestSync () {

    }

    constructor (connector: SyncConnector) {

        this.connector = connector;
        this.readyToRecieve = false;
        this.connector.onRecieve((message) => {

            switch (message.type) {

            case "action":
                if (!this.readyToRecieve) {

                    break;

                }
                this.connector.send({
                    type: "confirm",
                    num: message.num
                });
                this.callback({action: message.action,
                    argumentList: message.argumentList});

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

                break;
            default:
                break;

            }

        });

    }

}

/**
 * @see SyncOrganizerType
 */
export class SyncOrganizer_Subscriber implements SyncOrganizer {

    connector: SyncConnector;

    numSend: number;

    numConfirmed: number;

    waitForSync: boolean;

    queuedActions: SyncAction[];

    callback: (action: SyncAction) => void;

    fullSyncCallback: (data: unknown) => void;

    send (action: SyncAction) {

        // queue action if we are currently syncing
        if (this.waitForSync) {

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

    onRecieve (callback: (action: SyncAction) => void) {

        this.callback = callback;

    }

    // eslint-disable-next-line max-len
    // eslint-disable-next-line @typescript-eslint/no-empty-function, class-methods-use-this
    getFullSyncData (_callback: () => unknown) {
    }

    onFullSync (callback: (data: unknown) => void) {

        this.fullSyncCallback = callback;

    }

    requestSync () {

        this.waitForSync = true;
        this.connector.send({
            type: "request-sync"
        });

    }

    constructor (connector: SyncConnector) {

        this.numSend = 0;
        this.numConfirmed = 0;
        this.waitForSync = false;
        this.connector = connector;
        this.queuedActions = [];

        this.connector.onRecieve((message) => {

            switch (message.type) {

            case "action":
                if (this.numSend !== this.numConfirmed) {

                    this.connector.send({
                        type: "request-sync"
                    });
                    break;

                }
                this.callback({action: message.action,
                    argumentList: message.argumentList});
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
                this.queuedActions.forEach((action) => {

                    this.connector.send({
                        type: "action",
                        action: action.action,
                        argumentList: action.argumentList,
                        num: ++(this.numSend)
                    });

                });
                this.queuedActions = [];
                this.waitForSync = false;
                break;

            default:
                break;

            }

        });

    }

}
