import {SyncAction, SyncConnector, SyncOrganizer} from "../core";

/**
 * @see SyncOrganizerType
 */
export class SyncOrganizerOwner implements SyncOrganizer {

    connector: SyncConnector;

    readyToRecieve: boolean;

    callback: (action: SyncAction) => void;

    getFullSyncCallback: () => unknown;

    send (action: SyncAction): void {

        this.connector.send({
            type: "action",
            action: action.action,
            argumentList: action.argumentList,
            num: 0
        });

        this.callback(action);

    }

    onRecieve (callback: (action: SyncAction) => void): void {

        this.callback = callback;

    }

    getFullSyncData (callback: () => unknown): void {

        this.getFullSyncCallback = callback;

    }

    // eslint-disable-next-line max-len
    // eslint-disable-next-line @typescript-eslint/no-empty-function, class-methods-use-this
    onFullSync (): void {
    }

    // eslint-disable-next-line max-len
    // eslint-disable-next-line @typescript-eslint/no-empty-function, class-methods-use-this
    requestSync (): void {

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
