import {SyncAction, SyncOrganizer} from "./SyncOrganizer";
import {SyncConnector} from "./SyncConnector";

/**
 * @see SyncOrganizerType
 */
export class SyncOrganizerSubscriber implements SyncOrganizer {

    connector: SyncConnector;

    numSend: number;

    numConfirmed: number;

    waitForSync: boolean;

    queuedActions: SyncAction[];

    callback: (action: SyncAction) => void;

    fullSyncCallback: (data: unknown) => void;

    send (action: SyncAction): void {

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

    onRecieve (callback: (action: SyncAction) => void): void {

        this.callback = callback;

    }

    // eslint-disable-next-line max-len
    // eslint-disable-next-line @typescript-eslint/no-empty-function, class-methods-use-this
    getFullSyncData (): void {
    }

    onFullSync (callback: (data: unknown) => void): void {

        this.fullSyncCallback = callback;

    }

    requestSync (): void {

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
