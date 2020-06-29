import { SyncConnector_Direct } from "../core/sync_alt/SyncConnector";
import { SyncObject } from "../../core/sync_alt/SyncObject";
import { SyncOrganizerType } from "../../core/sync_alt/SyncOrganizer";

const TARGET_FILE = "/core/sync_alt/SyncObject.ts";

interface DummyInterface
{
    addOne: () => void;
    addN: (n: number) => void;
    addAPlusB: (a: number, b: number) => void;
}

class Dummy implements DummyInterface
{
    target: number;

    addOne()
    {
        this.target++;
    }

    addN(n: number)
    {
        this.target += n;
    }

    addAPlusB(a: number, b: number)
    {
        this.target += a + b;
    }

    constructor (target: number = 0)
    {
        this.target = target;
    }
}

class SyncDummyWrapper implements DummyInterface
{
    syncObject: SyncObject<Dummy>;

    addOne()
    {
        this.syncObject.runAction({ action: "addOne", argumentList: [] });
    }
    addN(n: number)
    {
        this.syncObject.runAction({ action: "addN", argumentList: [ n ] });
    }
    addAPlusB(a: number, b: number)
    {
        this.syncObject.runAction({ action: "addAPlusB", argumentList: [ a, b ] });
    }

    constructor (syncObject: SyncObject<Dummy>)
    {
        this.syncObject = syncObject;
    }

}

test(`CLASS SyncObject @ '${TARGET_FILE}'`, () =>
{
    let ownerConnector = new SyncConnector_Direct();
    let subscriberConnector = new SyncConnector_Direct(ownerConnector);

    let ownerObject = new SyncObject<Dummy>(SyncOrganizerType.OWNER, ownerConnector, new Dummy(), under => { return { number: under.target }; }, recieved => new Dummy(recieved.number));
    let subscriberObject = new SyncObject<Dummy>(SyncOrganizerType.SUBSCRIBER, subscriberConnector, new Dummy(), under => { return { number: under.target }; }, recieved => new Dummy(recieved.number));

    let owner = new SyncDummyWrapper(ownerObject);
    let subsciber = new SyncDummyWrapper(subscriberObject);

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