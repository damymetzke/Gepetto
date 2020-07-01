import { SyncOrganizer, SyncOrganizerType, SyncOrganizer_Owner, SyncOrganizer_Subscriber, SyncAction } from "./SyncOrganizer.js";
import { SyncConnector } from "./SyncConnector.js";
type ActionCallbackFunction<UnderType> = ((under: UnderType, argumentList: any[]) => void);
type ActionAllCallbackFunction<UnderType> = ((action: string, under: UnderType, argumentList: any[]) => void);

export class SyncObject<UnderType>
{
    under: UnderType;
    organizer: SyncOrganizer;

    callbacks: {
        [ action: string ]: ActionCallbackFunction<UnderType>[];
    };

    allCallbacks: ActionAllCallbackFunction<UnderType>[];

    runAction(action: SyncAction)
    {
        this.organizer.send(action);
    }

    onRecieve(action: SyncAction)
    {
        if (!this.under)
        {
            return; //under is invalid
        }
        if (!(action.action in this.under))
        {
            return; //action does not exist
        }

        if (typeof this.under[ action.action ] !== "function")
        {
            return; //action is not a function
        }

        const targetFunction: (...argumentList: any) => any = this.under[ action.action ];
        targetFunction.call(this.under, ...action.argumentList);

        if (action.action in this.callbacks)
        {
            this.callbacks[ action.action ].forEach(callback => callback(this.under, action.argumentList));
        }
        this.allCallbacks.forEach(callback => callback(action.action, this.under, action.argumentList));
    }

    addActionCallback(action: string, callback: ActionCallbackFunction<UnderType>)
    {
        if (!(action in this.callbacks))
        {
            this.callbacks[ action ] = [];
        }
        this.callbacks[ action ].push(callback);
    }

    addAllActionCallback(callback: ActionAllCallbackFunction<UnderType>)
    {
        this.allCallbacks.push(callback);
    }

    constructor (organizerType: SyncOrganizerType, connector: SyncConnector, under: UnderType, toFullSync: (under: UnderType) => any, fromFullSync: (recieved: any) => UnderType)
    {
        switch (organizerType)
        {
            case SyncOrganizerType.OWNER:
                this.organizer = new SyncOrganizer_Owner(connector);
                break;

            case SyncOrganizerType.SUBSCRIBER:
                this.organizer = new SyncOrganizer_Subscriber(connector);
                break;

            default:
                throw ("no valid organizer type"); //todo: add null type
        }

        this.under = under;
        this.callbacks = {};
        this.allCallbacks = [];

        this.organizer.onRecieve(action => { this.onRecieve(action); });
        this.organizer.onFullSync(recieved =>
        {
            this.under = fromFullSync(recieved);
            this.allCallbacks.forEach(callback =>
            {
                callback("--fullSync", this.under, []);
            });
        });
        this.organizer.getFullSyncData(() =>
        {
            return toFullSync(this.under);
        });
    }
}