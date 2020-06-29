import { SyncOrganizer_Owner, SyncOrganizer_Subscriber, SyncConnector_Direct, SyncAction } from "../core/core";

test(``, () =>
{
    let ownerConnector = new SyncConnector_Direct();
    let subscriberConnector = new SyncConnector_Direct(ownerConnector);
    let owner = new SyncOrganizer_Owner(ownerConnector);
    let subscriber = new SyncOrganizer_Subscriber(subscriberConnector);

    let ownerResult: SyncAction[] = [];
    let subscriberResult: SyncAction[] = [];
    let subscriberFullSyncResult: any[] = [];

    owner.onRecieve(action =>
    {
        ownerResult.push(action);
    });

    subscriber.onRecieve(action =>
    {
        subscriberResult.push(action);
    });

    owner.getFullSyncData(() =>
    {
        return {
            type: "under"
        };
    });

    subscriber.onFullSync(object =>
    {
        subscriberFullSyncResult.push(object);
    });

    subscriber.send({ action: "notReady", argumentList: [] });
    subscriber.requestSync();
    subscriber.send({ action: "ready", argumentList: [] });
    owner.send({ action: "ping", argumentList: [ 2, 6 ] });
    subscriber.send({ action: "pong", argumentList: [ 6, 2 ] });

    expect(ownerResult).toStrictEqual(<SyncAction[]>[
        {
            action: "ready",
            argumentList: []
        },
        {
            action: "pong",
            argumentList: [ 6, 2 ]
        }
    ]);
    expect(subscriberResult).toStrictEqual(<SyncAction[]>[
        {
            action: "ping",
            argumentList: [ 2, 6 ]
        }
    ]);

    expect(subscriberFullSyncResult).toStrictEqual([
        {
            type: "under"
        }
    ]);
});
