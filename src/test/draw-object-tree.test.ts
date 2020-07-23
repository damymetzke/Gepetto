import { DrawObjectTree, DrawObject, TransformCommand, TransformCommandType, SerializedDrawObjectTree } from "./core/core";

import "./shared";

const TARGET_FILE = "core/draw-object-tree.js";

test(`CLASS_FUNCTION DrawObjectTree.ToPureObject @ '${TARGET_FILE}'`, () =>
{
    const drawObjectTree = new DrawObjectTree([
        new DrawObject("A", null),
        new DrawObject("B", null, [
            new TransformCommand(TransformCommandType.TRANSLATE),
            new TransformCommand(TransformCommandType.ROTATE, { rotation: 30 })
        ])
    ]);

    drawObjectTree.AddObject(new DrawObject("BA", drawObjectTree.rootObjects[ 1 ]));

    const drawObjectTreePure: SerializedDrawObjectTree = drawObjectTree.ToPureObject();

    expect(drawObjectTreePure.rootObjects).toContain("A");
    expect(drawObjectTreePure.rootObjects).toContain("B");
    expect(drawObjectTreePure.rootObjects).not.toContain("BA");

    console.log(drawObjectTreePure);

    expect(drawObjectTreePure.objects).toStrictEqual({
        "A": {
            name: "A",
            parent: null,
            transformCommands: []
        },
        "B": {
            name: "B",
            parent: null,
            transformCommands: [
                {
                    type: TransformCommandType.TRANSLATE,
                    fields: {
                        x: 0,
                        y: 0
                    }
                },
                {
                    type: TransformCommandType.ROTATE,
                    fields: {
                        rotation: 30
                    }
                }
            ]
        },
        "BA": {
            name: "BA",
            parent: "B",
            transformCommands: []
        }
    });
});

test(`CLASS_FUNCTION DrawObjectTree.FromPureObject @ '${TARGET_FILE}'`, () =>
{
    const drawObjectTreePure: SerializedDrawObjectTree = {
        rootObjects: [ "A", "B" ],
        objects: {
            "A": {
                name: "A",
                parent: null,
                transformCommands: []
            },
            "B": {
                name: "B",
                parent: null,
                transformCommands: [
                    {
                        type: TransformCommandType.TRANSLATE,
                        fields: {
                            x: 0,
                            y: 0
                        }
                    },
                    {
                        type: TransformCommandType.ROTATE,
                        fields: {
                            rotation: 30
                        }
                    }
                ]
            },
            "BA": {
                name: "BA",
                parent: "B",
                transformCommands: []

            }
        }
    };

    const drawObjectTree = new DrawObjectTree().FromPureObject(drawObjectTreePure);

    (<any>expect(drawObjectTree.rootObjects)).toBeTrueForAny((input: DrawObject) => input.name === "A");
    (<any>expect(drawObjectTree.rootObjects)).toBeTrueForAny((input: DrawObject) => input.name === "B");
    (<any>expect(drawObjectTree.rootObjects)).not.toBeTrueForAny((input: DrawObject) => input.name === "BA");

    const drawObjectTreeObjectKeys = Object.keys(drawObjectTree.objects);

    expect(drawObjectTreeObjectKeys).toContain("A");
    expect(drawObjectTreeObjectKeys).toContain("B");
    expect(drawObjectTreeObjectKeys).toContain("BA");

    expect(drawObjectTree.rootObjects[ 0 ]).toStrictEqual(drawObjectTree.objects[ "A" ]);
    expect(drawObjectTree.rootObjects[ 1 ]).toStrictEqual(drawObjectTree.objects[ "B" ]);
});