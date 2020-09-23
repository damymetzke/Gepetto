import "./shared";
import {DrawObject,
    SerializedDrawObject,
    SerializedTransformCommand,
    Transform,
    TransformCommand,
    TransformCommandType} from "./core/core";


const TARGET_FILE = "core/draw-object.ts";

test(`CLASS_CONSTRUCTOR DrawObject @ '${TARGET_FILE}'`, () => {

    const defaultObject = new DrawObject();

    const parent = new DrawObject("PARENT_OBJECT");
    const child = new DrawObject("CHILD_OBJECT", parent);

    const namedParent = new DrawObject("CHILD_OBJECT", "PARENT_OBJECT");
    const containsCommands = new DrawObject("COMMANDS", null, [
        new TransformCommand(TransformCommandType.TRANSLATE, {x: 10,
            y: 20}),
        new TransformCommand(TransformCommandType.SCALE, {x: 0.4,
            y: 2.3}),
        new TransformCommand(TransformCommandType.ROTATE, {rotation: 36})
    ]);

    expect(defaultObject.name).toStrictEqual("");
    expect(defaultObject.parent).toBeNull();
    expect(defaultObject.transformCommands.length).toStrictEqual(0);

    expect(parent.name).toStrictEqual("PARENT_OBJECT");
    expect(child.name).toStrictEqual("CHILD_OBJECT");
    expect(parent.parent).toBeNull();
    expect(child.parent).toStrictEqual(parent);

    expect(parent.children).toContain(child);

    expect(namedParent.parent).toStrictEqual("PARENT_OBJECT");

    expect(containsCommands.transformCommands.length).toStrictEqual(3);
    expect(containsCommands.transformCommands[0].fields).toStrictEqual({x: 10,
        y: 20});
    expect(containsCommands.transformCommands[1].fields).toStrictEqual({x: 0.4,
        y: 2.3});
    expect(containsCommands.transformCommands[2].fields)
        .toStrictEqual({rotation: 36});

    expect(containsCommands.transformCommands[0].typeIndex)
        .toStrictEqual(TransformCommandType.TRANSLATE);

    expect(containsCommands.transformCommands[1].typeIndex)
        .toStrictEqual(TransformCommandType.SCALE);

    expect(containsCommands.transformCommands[2].typeIndex)
        .toStrictEqual(TransformCommandType.ROTATE);

});
1;
test(`CLASS_FUNCTION DrawObject.AddTransformCommand @ '${TARGET_FILE}'`, () => {

    const drawObject = new DrawObject();

    drawObject.addTransformCommand(new TransformCommand(
        TransformCommandType.TRANSLATE,
        {x: 4,
            y: 7}
    ));

    expect(drawObject.transformCommands.length).toStrictEqual(1);
    expect(drawObject.transformCommands[0].typeIndex)
        .toStrictEqual(TransformCommandType.TRANSLATE);

    expect(drawObject.transformCommands[0].fields).toStrictEqual({x: 4,
        y: 7});

});

test(`CLASS_FUNCTION DrawObject.WorldTransform @ '${TARGET_FILE}'`, () => {

    const objectA = new DrawObject("A", null, [
        new TransformCommand(TransformCommandType.TRANSLATE, {x: 10,
            y: 20})
    ]);
    const objectB = new DrawObject(
        "B",
        objectA,
        [new TransformCommand(TransformCommandType.ROTATE, {rotation: 45})]
    );
    const objectC = new DrawObject("C", objectB, [
        new TransformCommand(TransformCommandType.TRANSLATE, {x: 30,
            y: -25}), new TransformCommand(TransformCommandType.SCALE, {x: 1.5,
            y: 1})
    ]);

    expect(objectC.worldTransform())
        .toEqualTransform(new Transform([
            1.06,
            1.06,
            -0.71,
            0.71,
            59.5,
            34.14
        ]));

});

test(`CLASS_FUNCTION DrawObject.ToPureObject @ '${TARGET_FILE}'`, () => {

    const parent = new DrawObject("PARENT_OBJECT");
    const child = new DrawObject("CHILD_OBJECT", parent);
    const namedParent = new DrawObject("CHILD_OBJECT_ALT", "PARENT_OBJECT_ALT");
    const commands = new DrawObject("COMMANDS_OBJECT", null, [
        new TransformCommand(TransformCommandType.TRANSLATE, {x: 10,
            y: 20}),
        new TransformCommand(TransformCommandType.ROTATE, {rotation: 135})
    ]);

    const parentPure = parent.serialize();
    const childPure = child.serialize();
    const namedParentPure = namedParent.serialize();
    const commandsPure = commands.serialize();

    expect(parentPure).toStrictEqual(<SerializedDrawObject>{
        name: "PARENT_OBJECT",
        parent: null,
        transformCommands: []
    });
    expect(childPure).toStrictEqual(<SerializedDrawObject>{
        name: "CHILD_OBJECT",
        parent: "PARENT_OBJECT",
        transformCommands: []
    });
    expect(namedParentPure).toStrictEqual(<SerializedDrawObject>{
        name: "CHILD_OBJECT_ALT",
        parent: "PARENT_OBJECT_ALT",
        transformCommands: []
    });
    expect(commandsPure).toStrictEqual(<SerializedDrawObject>{
        name: "COMMANDS_OBJECT",
        parent: null,
        transformCommands: [
            <SerializedTransformCommand>{
                type: TransformCommandType.TRANSLATE,
                fields: {x: 10,
                    y: 20}
            },
            <SerializedTransformCommand>{
                type: TransformCommandType.ROTATE,
                fields: {rotation: 135}
            }

        ]
    });

});

test(`CLASS_FUNCTION DrawObject.FromPureObject @ '${TARGET_FILE}'`, () => {

    const pure: SerializedDrawObject = {
        name: "PURE_OBJECT",
        parent: "PARENT_OBJECT",
        transformCommands: [
            {
                type: TransformCommandType.SCALE,
                fields: {x: 1.5,
                    y: 2.3}
            },
            {
                type: TransformCommandType.SHEARX,
                fields: {x: 0.9}
            }
        ]
    };

    const fromPure = new DrawObject().deserialize(pure);

    expect(fromPure.name).toStrictEqual("PURE_OBJECT");
    expect(fromPure.parent).toStrictEqual("PARENT_OBJECT");
    expect(fromPure.transformCommands.length).toStrictEqual(2);

    expect(fromPure.transformCommands[0].typeIndex)
        .toStrictEqual(TransformCommandType.SCALE);

    expect(fromPure.transformCommands[0].fields).toStrictEqual({x: 1.5,
        y: 2.3});
    expect(fromPure.transformCommands[1].typeIndex)
        .toStrictEqual(TransformCommandType.SHEARX);

    expect(fromPure.transformCommands[1].fields).toStrictEqual({x: 0.9});

});

test(`CLASS_FUNCTION DrawObject.Clone @ '${TARGET_FILE}'`, () => {

    const objectA = new DrawObject("A");
    const objectB = new DrawObject("B", objectA);
    const objectC = new DrawObject("C", objectB);

    const recursedClone = objectC.clone(true);
    const singleClone = objectC.clone();

    expect(recursedClone.name).toStrictEqual("C");
    expect(singleClone.name).toStrictEqual("C");

    expect(typeof recursedClone.parent).toStrictEqual("object");
    expect(singleClone.parent).toStrictEqual("B");

    expect((<DrawObject>recursedClone.parent).name).toStrictEqual("B");
    expect((<DrawObject>(<DrawObject>recursedClone.parent).parent).name)
        .toStrictEqual("A");

});
