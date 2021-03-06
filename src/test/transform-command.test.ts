import "./shared";
import {SerializedTransformCommand,
    Transform,
    TransformCommand,
    TransformCommandType} from "./core/core";


const TARGET_FILE = "core/transform-command.ts";

test(
    `CLASS_CONSTRUCTROR TransformCommand @ '${TARGET_FILE}' (type only)`,
    () => {

        const translate = new TransformCommand("TRANSLATE");
        const scale = new TransformCommand("SCALE");
        const rotate = new TransformCommand("ROTATE");
        const shearX = new TransformCommand("SHEARX");
        const shearY = new TransformCommand("SHEARY");

        expect(translate.fields).toStrictEqual({x: 0,
            y: 0});
        expect(scale.fields).toStrictEqual({x: 1,
            y: 1});
        expect(rotate.fields).toStrictEqual({rotation: 0});
        expect(shearX.fields).toStrictEqual({x: 0});
        expect(shearY.fields).toStrictEqual({y: 0});

        const specificTranslate = new TransformCommand("TRANSLATE", {x: 5465});
        const specificScale = new TransformCommand("SCALE", {x: 4492,
            y: 1095});

        expect(specificTranslate.fields).toStrictEqual({x: 5465,
            y: 0});
        expect(specificScale.fields).toStrictEqual({x: 4492,
            y: 1095});

        expect(() => {

            // we are testing for exceptions here
            // eslint-disable-next-line no-new
            new TransformCommand(<TransformCommandType>(9999));

        }).toThrow();

    }
);

test(`CLASS_FUNCTION TransformCommand.GetTransform @ '${TARGET_FILE}'`, () => {

    const translateCommand = new TransformCommand("TRANSLATE", {x: 2142,
        y: 7854});
    const scaleCommand = new TransformCommand("SCALE", {x: 7384,
        y: 8285});
    const rotateCommand = new TransformCommand("ROTATE", {rotation: 98});
    const shearCommand = new TransformCommand("SHEARX", {x: 4887});

    const translateTransform = translateCommand.getTransform();
    const scaleTransform = scaleCommand.getTransform();
    const rotateTransform = rotateCommand.getTransform();
    const shearTransform = shearCommand.getTransform();

    expect(translateTransform).toEqualTransform(new Transform([
        1,
        0,
        0,
        1,
        2142,
        7854
    ]));
    expect(scaleTransform).toEqualTransform(new Transform([
        7384,
        0,
        0,
        8285,
        0,
        0
    ]));
    expect(rotateTransform).toEqualTransform(new Transform([
        -0.139,
        0.990,
        -0.990,
        -0.139,
        0,
        0
    ]));
    expect(shearTransform).toEqualTransform(new Transform([
        1,
        0,
        4887,
        1,
        0,
        0
    ]));

});

test(`CLASS_FUNCTION TransformCommand.ToPureObject @ '${TARGET_FILE}'`, () => {

    const commandA = new TransformCommand(
        TransformCommandType.TRANSLATE,
        {x: 5647,
            y: 4698}
    );
    const commandB = new TransformCommand(
        TransformCommandType.SCALE,
        {x: 9464}
    );

    const pureA = commandA.serialize();
    const pureB = commandB.serialize();

    expect(pureA).toStrictEqual(<SerializedTransformCommand>{
        type: TransformCommandType.TRANSLATE,
        fields: {
            x: 5647,
            y: 4698
        }
    });

    expect(pureB).toStrictEqual(<SerializedTransformCommand>{
        type: TransformCommandType.SCALE,
        fields: {
            x: 9464,
            y: 1
        }
    });

});

test(
    `CLASS_FUNCTION TransformCommand.FromPureObject @ '${TARGET_FILE}'`,
    () => {

        const pureA: SerializedTransformCommand = {
            type: TransformCommandType.ROTATE,
            fields: {
                rotation: 99
            }
        };
        const pureB: SerializedTransformCommand = {
            type: TransformCommandType.SHEARX,
            fields: {
                x: 3482
            }
        };

        const commandA = new TransformCommand().deserialize(pureA);
        const commandB = new TransformCommand().deserialize(pureB);

        expect(commandA.typeIndex).toStrictEqual(TransformCommandType.ROTATE);
        expect(commandB.typeIndex).toStrictEqual(TransformCommandType.SHEARX);
        expect(commandA.fields).toStrictEqual({rotation: 99});
        expect(commandB.fields).toStrictEqual({x: 3482});

    }
);

test(`CLASS_FUNCTION TransformCommand.Clone @ '${TARGET_FILE}'`, () => {

    const command = new TransformCommand(TransformCommandType.SCALE, {x: 541,
        y: 9394});

    const cloned = command.clone();

    expect(cloned).toStrictEqual(command);

});

test(`CLASS_FUNCTION TransformCommand.AddRelative @ '${TARGET_FILE}'`, () => {

    const translateA = new TransformCommand(
        TransformCommandType.TRANSLATE,
        {x: 95,
            y: 2837}
    );
    const translateB = new TransformCommand(
        TransformCommandType.TRANSLATE,
        {x: 4340,
            y: 9818}
    );
    const scaleA = new TransformCommand(TransformCommandType.SCALE, {x: 67,
        y: 41});
    const scaleB = new TransformCommand(TransformCommandType.SCALE, {x: 22,
        y: 38});
    const rotateA = new TransformCommand(
        TransformCommandType.ROTATE,
        {rotation: 221}
    );
    const rotateB = new TransformCommand(
        TransformCommandType.ROTATE,
        {rotation: 155}
    );
    const shearA = new TransformCommand(TransformCommandType.SHEARX, {x: 661});
    const shearB = new TransformCommand(TransformCommandType.SHEARX, {x: 7679});

    const translateResult = translateA.addRelative(translateB);
    const scaleResult = scaleA.addRelative(scaleB);
    const rotateResult = rotateA.addRelative(rotateB);
    const shearResult = shearA.addRelative(shearB);

    expect(translateResult).toStrictEqual(new TransformCommand(
        TransformCommandType.TRANSLATE,
        {x: 4435,
            y: 12655}
    ));
    expect(scaleResult).toStrictEqual(new TransformCommand(
        TransformCommandType.SCALE,
        {x: 1474,
            y: 1558}
    ));
    expect(rotateResult).toStrictEqual(new TransformCommand(
        TransformCommandType.ROTATE,
        {rotation: 16}
    ));
    expect(shearResult).toStrictEqual(new TransformCommand(
        TransformCommandType.SHEARX,
        {x: 8340}
    ));

    expect(() => {

        translateA.addRelative(scaleB);

    }).toThrow();

});
