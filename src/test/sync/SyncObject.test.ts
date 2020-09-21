import {SyncConnectorDirect,
    SyncObject,
    SyncOrganizerType} from "../core/core";

const TARGET_FILE = "/core/sync_alt/SyncObject.ts";

interface DummyInterface
{
    addOne: () => void;
    addN: (n: number) => void;
    addAPlusB: (a: number, b: number) => void;
}

class Dummy implements DummyInterface {

    target: number;

    addOne () {

        this.target++;

    }

    addN (n: number) {

        this.target += n;

    }

    addAPlusB (a: number, b: number) {

        this.target += a + b;

    }

    constructor (target = 0) {

        this.target = target;

    }

}

class SyncDummyWrapper implements DummyInterface {

    syncObject: SyncObject<Dummy>;

    addOne () {

        this.syncObject.runAction({action: "addOne",
            argumentList: []});

    }

    addN (n: number) {

        this.syncObject.runAction({action: "addN",
            argumentList: [n]});

    }

    addAPlusB (a: number, b: number) {

        this.syncObject.runAction({action: "addAPlusB",
            argumentList: [a, b]});

    }

    constructor (syncObject: SyncObject<Dummy>) {

        this.syncObject = syncObject;

    }

}

interface FullSyncDataDummy
{
    number: number;
}

test(`CLASS SyncObject @ '${TARGET_FILE}'`, () => {

    const ownerConnector = new SyncConnectorDirect();
    const subscriberConnector = new SyncConnectorDirect(ownerConnector);

    const ownerObject = new SyncObject<Dummy>(
        SyncOrganizerType.OWNER,
        ownerConnector,
        new Dummy(),
        (under): FullSyncDataDummy => ({number: under.target}),
        (recieved: FullSyncDataDummy) => new Dummy(recieved.number)
    );
    const subscriberObject = new SyncObject<Dummy>(
        SyncOrganizerType.SUBSCRIBER,
        subscriberConnector,
        new Dummy(),
        (under): FullSyncDataDummy => ({number: under.target}),
        (recieved: FullSyncDataDummy) => new Dummy(recieved.number)
    );

    const owner = new SyncDummyWrapper(ownerObject);
    const subsciber = new SyncDummyWrapper(subscriberObject);

    subsciber.syncObject.organizer.requestSync();

    expect(owner.syncObject.under.target).toStrictEqual(0);
    expect(subsciber.syncObject.under.target).toStrictEqual(0);

    owner.addOne();

    expect(owner.syncObject.under.target).toStrictEqual(1);
    expect(subsciber.syncObject.under.target).toStrictEqual(1);

    subsciber.addN(5);

    expect(owner.syncObject.under.target).toStrictEqual(6);
    expect(subsciber.syncObject.under.target).toStrictEqual(6);

    owner.addAPlusB(2, 6);

    expect(owner.syncObject.under.target).toStrictEqual(14);
    expect(subsciber.syncObject.under.target).toStrictEqual(14);

});
