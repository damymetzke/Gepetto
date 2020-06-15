import { SynchronizedTreeLog, SyncLog } from "./core/sync/synchronized-tree-log";
import { TransformCommandType } from "./core/transform-command";

import "./shared";

const TARGET_FILE = "core/sync/synchronized-tree.ts";

test(`CLASS_CONSTRUCTOR SynchronizedTree @ '${TARGET_FILE}'`, () =>
{
    const tree = new SynchronizedTreeLog();


    const objectA = tree.AddObject("A");
    objectA.ChangeName("A_ALT");

    const objectB = tree.AddObject("B");
    objectB.Reparent(objectA);

    const transformB0 = objectB.AddTransformCommand(TransformCommandType.TRANSLATE);
    const transformB1 = objectB.AddTransformCommand(TransformCommandType.ROTATE);

    expect(objectA.objectName).toStrictEqual("A_ALT");
    expect(objectB.objectName).toStrictEqual("B");
    expect(transformB0.objectName).toStrictEqual("B");
    expect(transformB1.objectName).toStrictEqual("B");
    expect(transformB0.transformCommandIndex).toStrictEqual(0);
    expect(transformB1.transformCommandIndex).toStrictEqual(1);

    const EXPECTED_ACTIONS: any[] = [
        {
            type: "send",
            action: "add-object",
            data: {
                name: "A"
            }
        },
        {
            type: "send",
            action: "change-name",
            data: {
                originalObject: "A",
                newName: "A_ALT"
            }
        },
        {
            type: "send",
            action: "add-object",
            data: {
                name: "B"
            }
        },
        {
            type: "send",
            action: "reparent",
            data: {
                child: "B",
                parent: "A_ALT"
            }
        },
        {
            type: "send",
            action: "add-transform-command",
            data: {
                object: "B",
                type: TransformCommandType.TRANSLATE
            }
        },
        {
            type: "send",
            action: "add-transform-command",
            data: {
                object: "B",
                type: TransformCommandType.ROTATE
            }
        }
    ];

    EXPECTED_ACTIONS.forEach((action, index) =>
    {
        expect(action.type).toStrictEqual(tree.loggedActions[ index ].type);
        expect(action.action).toStrictEqual(tree.loggedActions[ index ].action);
        expect(action.data).toStrictEqual(tree.loggedActions[ index ].data);
    });
});
