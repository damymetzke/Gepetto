import { Transform, TransformCommand } from "./core/core";

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