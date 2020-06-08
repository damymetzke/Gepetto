import { TransformCommand } from "./core/core";

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