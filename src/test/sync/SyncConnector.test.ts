import { SyncConnector_Direct, SyncMessageAlt } from "../core/core";

const TARGET_FILE = "core/sync_alt/SyncConnector.ts";

test(``, () =>
{
    let a = new SyncConnector_Direct();
    let b = new SyncConnector_Direct(a);

    let aResult: SyncMessageAlt[] = [];
    let bResult: SyncMessageAlt[] = [];

    a.onRecieve((message) =>
    {
        aResult.push(message);
    });

    b.onRecieve((message) =>
    {
        bResult.push(message);
    });

    a.send({
        type: "action",
        action: "A",
        argumentList: [],
        num: 1
    });

    b.send({
        type: "action",
        action: "B",
        argumentList: [ 1, 2, 3 ],
        num: 1
    });

    b.send({
        type: "action",
        action: "B2",
        argumentList: [],
        num: 2
    });

    a.send({
        type: "action",
        action: "A",
        argumentList: [ "Hello", 42, "World!" ],
        num: 2
    });

    a.send({
        type: "confirm",
        num: 1
    });

    a.send({
        type: "confirm",
        num: 2
    });

    b.send({
        type: "request-sync"
    });

    a.send({
        type: "sync",
        object: "Hello World!"
    });

    expect(aResult).toStrictEqual([
        {
            type: "action",
            action: "B",
            argumentList: [ 1, 2, 3 ],
            num: 1
        },
        {
            type: "action",
            action: "B2",
            argumentList: [],
            num: 2
        },
        {
            type: "request-sync"
        }
    ]);

    expect(bResult).toStrictEqual([
        {
            type: "action",
            action: "A",
            argumentList: [],
            num: 1
        },
        {
            type: "action",
            action: "A",
            argumentList: [ "Hello", 42, "World!" ],
            num: 2
        },
        {
            type: "confirm",
            num: 1
        },
        {
            type: "confirm",
            num: 2
        },
        {
            type: "sync",
            object: "Hello World!"
        }
    ]);
});