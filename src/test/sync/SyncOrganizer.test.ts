import {SyncAction,
    SyncConnectorDirect,
    SyncOrganizerOwner,
    SyncOrganizerSubscriber} from "../core/core";

test("", () => {

    const ownerConnector = new SyncConnectorDirect();
    const subscriberConnector = new SyncConnectorDirect(ownerConnector);
    const owner = new SyncOrganizerOwner(ownerConnector);
    const subscriber = new SyncOrganizerSubscriber(subscriberConnector);

    const ownerResult: SyncAction[] = [];
    const subscriberResult: SyncAction[] = [];
    const subscriberFullSyncResult: unknown[] = [];

    owner.onRecieve((action) => {

        ownerResult.push(action);

    });

    subscriber.onRecieve((action) => {

        subscriberResult.push(action);

    });

    owner.getFullSyncData(() => ({
        type: "under"
    }));

    subscriber.onFullSync((object) => {

        subscriberFullSyncResult.push(object);

    });

    subscriber.send({action: "notReady",
        argumentList: []});
    subscriber.requestSync();
    subscriber.send({action: "ready",
        argumentList: []});
    owner.send({action: "ping",
        argumentList: [2, 6]});
    subscriber.send({action: "pong",
        argumentList: [6, 2]});

    expect(ownerResult).toStrictEqual(<SyncAction[]>[
        {
            action: "ready",
            argumentList: []
        },
        {
            action: "ping",
            argumentList: [2, 6]
        },
        {
            action: "pong",
            argumentList: [6, 2]
        }
    ]);
    expect(subscriberResult).toStrictEqual(<SyncAction[]>[
        {
            action: "notReady",
            argumentList: []
        },
        {
            action: "ready",
            argumentList: []
        },
        {
            action: "ping",
            argumentList: [2, 6]
        },
        {
            action: "pong",
            argumentList: [6, 2]
        }
    ]);

    expect(subscriberFullSyncResult).toStrictEqual([
        {
            type: "under"
        }
    ]);

});
