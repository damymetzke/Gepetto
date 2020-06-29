import { SyncOrganizer, SyncOrganizerType, SyncOrganizer_Owner, SyncOrganizer_Subscriber, SyncAction } from "./SyncOrganizer";
import { SyncConnector } from "../../test/core/sync_alt/SyncConnector";

export class SyncObject<UnderType>
{
    under: UnderType;
    organizer: SyncOrganizer;

    runAction(action: SyncAction)
    {
        this.organizer.send(action);
    }

    onRecieve(action: SyncAction)
    {
        if (!(action.action in this.under))
        {
            return; //action does not exist
        }

        if (typeof this.under[ action.action ] !== "function")
        {
            return; //action is not a function
        }

        const targetFunction: (...argumentList: any) => any = this.under[ action.action ];
        targetFunction(...action.argumentList);
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

        this.organizer.onRecieve(this.onRecieve);
        this.organizer.onFullSync(recieved =>
        {
            this.under = fromFullSync(recieved);
        });
        this.organizer.getFullSyncData(() =>
        {
            return toFullSync(this.under);
        });
    }
}