import {SyncAction,
    SyncOrganizer,
    SyncOrganizerType,
    SyncOrganizer_Owner,
    SyncOrganizer_Subscriber} from "./SyncOrganizer.js";
import {SyncConnector} from "./SyncConnector.js";
type ActionCallbackFunction<UnderType> =
    ((under: UnderType, argumentList: any[]) => void);
type ActionAllCallbackFunction<UnderType> =
    ((action: string, under: UnderType, argumentList: any[]) => void);

export type SyncConverter =
    {
        ConvertToSend(rawInput: any[]): any[];
        ConvertFromSend(recieved): any[];
    };

export class SyncObject<UnderType> {

    under: UnderType;

    organizer: SyncOrganizer;

    conversions: { [ action: string ]: SyncConverter; };

    callbacks: {
        [ action: string ]: ActionCallbackFunction<UnderType>[];
    };

    allCallbacks: ActionAllCallbackFunction<UnderType>[];

    runAction (action: SyncAction) {

        if (action.action in this.conversions) {

            this.organizer.send({action: action.action,
                argumentList: this.conversions[action.action]
                    .ConvertToSend(action.argumentList)});

        } else {

            this.organizer.send(action);

        }

    }

    onRecieve (action: SyncAction) {

        if (!this.under) {

            // under is invalid
            return;

        }
        if (!(action.action in this.under)) {

            // action does not exist
            return;

        }

        if (typeof this.under[action.action] !== "function") {

            // action is not a function
            return;

        }

        const argumentList = (action.action in this.conversions)
            ? this.conversions[action.action]
                .ConvertFromSend(action.argumentList)
            : action.argumentList;

        const targetFunction: (...recieveArgumentList: any) => any
        = this.under[action.action];

        targetFunction.call(this.under, ...argumentList);

        if (action.action in this.callbacks) {

            this.callbacks[action.action]
                .forEach((callback) => callback(this.under, argumentList));

        }
        this.allCallbacks
            .forEach((callback) => callback(
                action.action,
                this.under,
                argumentList
            ));

    }

    addActionCallback (
        action: string,
        callback: ActionCallbackFunction<UnderType>
    ): void {

        if (!(action in this.callbacks)) {

            this.callbacks[action] = [];

        }
        this.callbacks[action].push(callback);

    }

    addAllActionCallback (callback: ActionAllCallbackFunction<UnderType>):
    void {

        this.allCallbacks.push(callback);

    }

    constructor (
        organizerType: SyncOrganizerType,
        connector: SyncConnector,
        under: UnderType,
        toFullSync: (fullSyncUnder: UnderType) => any,
        fromFullSync: (recieved: any) => UnderType,
        conversions: { [ action: string ]: SyncConverter; } = {}
    ) {

        switch (organizerType) {

        case SyncOrganizerType.OWNER:
            this.organizer = new SyncOrganizer_Owner(connector);
            break;

        case SyncOrganizerType.SUBSCRIBER:
            this.organizer = new SyncOrganizer_Subscriber(connector);
            break;

        default:
            // todo: add null type
            throw new Error("no valid organizer type");

        }

        this.under = under;
        this.callbacks = {};
        this.allCallbacks = [];
        this.conversions = conversions;

        this.organizer.onRecieve((action) => {

            this.onRecieve(action);

        });
        this.organizer.onFullSync((recieved) => {

            this.under = fromFullSync(recieved);
            this.allCallbacks.forEach((callback) => {

                callback("--fullSync", this.under, []);

            });
            if ("--fullSync" in this.callbacks) {

                this.callbacks["--fullSync"].forEach((callback) => {

                    callback(this.under, []);

                });

            }

        });
        this.organizer.getFullSyncData(() => toFullSync(this.under));

    }

}
