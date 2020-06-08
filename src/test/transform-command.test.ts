import { Transform, TransformCommand, TransformCommandType, TransformCommandPureObject } from "./core/core";

import "./shared";

const TARGET_FILE = "core/transform-command.ts";

test(`CLASS_CONSTRUCTROR TransformCommand @ '${TARGET_FILE}' (type only)`, () =>
{
    const translate = new TransformCommand("TRANSLATE");
    const scale = new TransformCommand("SCALE");
    const rotate = new TransformCommand("ROTATE");
    const shearX = new TransformCommand("SHEARX");
    const shearY = new TransformCommand("SHEARY");

    expect(translate.fields).toStrictEqual({ x: 0, y: 0 });
    expect(scale.fields).toStrictEqual({ x: 1, y: 1 });
    expect(rotate.fields).toStrictEqual({ rotation: 0 });
    expect(shearX.fields).toStrictEqual({ x: 0 });
    expect(shearY.fields).toStrictEqual({ y: 0 });

    const specificTranslate = new TransformCommand("TRANSLATE", { x: 5465 });
    const specificScale = new TransformCommand("SCALE", { x: 4492, y: 1095 });

    expect(specificTranslate.fields).toStrictEqual({ x: 5465, y: 0 });
    expect(specificScale.fields).toStrictEqual({ x: 4492, y: 1095 });
});

test(`CLASS_FUNCTION TransformCommand.GetTransform @ '${TARGET_FILE}'`, () =>
{
    const translateCommand = new TransformCommand("TRANSLATE", { x: 2142, y: 7854 });
    const scaleCommand = new TransformCommand("SCALE", { x: 7384, y: 8285 });
    const rotateCommand = new TransformCommand("ROTATE", { rotation: 98 });
    const shearCommand = new TransformCommand("SHEARX", { x: 4887 });

    const translateTransform = translateCommand.GetTransform();
    const scaleTransform = scaleCommand.GetTransform();
    const rotateTransform = rotateCommand.GetTransform();
    const shearTransform = shearCommand.GetTransform();

    (<any>expect(translateTransform)).toEqualTransform(new Transform([1, 0, 0, 1, 2142, 7854]));
    (<any>expect(scaleTransform)).toEqualTransform(new Transform([7384, 0, 0, 8285, 0, 0]));
    (<any>expect(rotateTransform)).toEqualTransform(new Transform([-0.139, 0.990, -0.990, -0.139, 0, 0]));
    (<any>expect(shearTransform)).toEqualTransform(new Transform([1, 0, 4887, 1, 0, 0]));
});

test(`CLASS_FUNCTION TransformCommand.ToPureObject @ '${TARGET_FILE}'`, () =>
{
    const commandA = new TransformCommand(TransformCommandType.TRANSLATE, { x: 5647, y: 4698 });
    const commandB = new TransformCommand(TransformCommandType.SCALE, { x: 9464 });

    const pureA = commandA.ToPureObject();
    const pureB = commandB.ToPureObject();

    expect(pureA).toStrictEqual(<TransformCommandPureObject>{
        type: TransformCommandType.TRANSLATE,
        fields: {
            x: 5647,
            y: 4698
        }
    });

    expect(pureB).toStrictEqual(<TransformCommandPureObject>{
        type: TransformCommandType.SCALE,
        fields: {
            x: 9464,
            y: 1
        }
    });
});

test(`CLASS_FUNCTION TransformCommand.FromPureObject @ '${TARGET_FILE}'`, () =>
{
    const pureA: TransformCommandPureObject = {
        type: TransformCommandType.ROTATE,
        fields: {
            rotation: 99
        }
    };
    const pureB: TransformCommandPureObject = {
        type: TransformCommandType.SHEARX,
        fields: {
            x: 3482
        }
    };

    const commandA = new TransformCommand().FromPureObject(pureA);
    const commandB = new TransformCommand().FromPureObject(pureB);

    expect(commandA.typeIndex).toStrictEqual(TransformCommandType.ROTATE);
    expect(commandB.typeIndex).toStrictEqual(TransformCommandType.SHEARX);
    expect(commandA.fields).toStrictEqual({ rotation: 99 });
    expect(commandB.fields).toStrictEqual({ x: 3482 });
});

test(`CLASS_FUNCTION TransformCommand.Clone @ '${TARGET_FILE}'`, () =>
{
    const command = new TransformCommand(TransformCommandType.SCALE, { x: 541, y: 9394 });

    const cloned = command.Clone();

    expect(cloned).toStrictEqual(command);
});

test(`CLASS_FUNCTION TransformCommand.AddRelative @ '${TARGET_FILE}'`, () =>
{
    const translateA = new TransformCommand(TransformCommandType.TRANSLATE, { x: 95, y: 2837 });
    const translateB = new TransformCommand(TransformCommandType.TRANSLATE, { x: 4340, y: 9818 });
    const scaleA = new TransformCommand(TransformCommandType.SCALE, { x: 67, y: 41 });
    const scaleB = new TransformCommand(TransformCommandType.SCALE, { x: 22, y: 38 });
    const rotateA = new TransformCommand(TransformCommandType.ROTATE, { rotation: 221 });
    const rotateB = new TransformCommand(TransformCommandType.ROTATE, { rotation: 155 });
    const shearA = new TransformCommand(TransformCommandType.SHEARX, { x: 661 });
    const shearB = new TransformCommand(TransformCommandType.SHEARX, { x: 7679 });

    const translateResult = translateA.AddRelative(translateB);
    const scaleResult = scaleA.AddRelative(scaleB);
    const rotateResult = rotateA.AddRelative(rotateB);
    const shearResult = shearA.AddRelative(shearB);

    expect(translateResult).toStrictEqual(new TransformCommand(TransformCommandType.TRANSLATE, { x: 4435, y: 12655 }));
    expect(scaleResult).toStrictEqual(new TransformCommand(TransformCommandType.SCALE, { x: 1474, y: 1558 }));
    expect(rotateResult).toStrictEqual(new TransformCommand(TransformCommandType.ROTATE, { rotation: 16 }));
    expect(shearResult).toStrictEqual(new TransformCommand(TransformCommandType.SHEARX, { x: 8340 }));
});