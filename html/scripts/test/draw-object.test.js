const { DrawObject, Transform } = require("../core/draw-object");
const { TransformCommand } = require("../core/transform-command");

const base = new DrawObject("Base");
const child = new DrawObject("Child", base);

base.AddTransformCommand(new TransformCommand("TRANSLATE", {
    x: 10, y: 20
}));
child.AddTransformCommand(new TransformCommand("SCALE", {
    x: 30,
    y: 40
}));

test("DrawObject Constructor", function ()
{
    //base
    expect(base.name).toStrictEqual("Base");
    expect(base.parent).toBeNull();
    expect(base.relativeTransform).toStrictEqual(new Transform([1, 0, 0, 1, 10, 20]));

    //child
    expect(child.name).toStrictEqual("Child");
    expect(child.parent).toBe(base);
    expect(child.relativeTransform).toStrictEqual(new Transform([30, 0, 0, 40, 0, 0]));
});

test("DrawObject WorldTransform", function ()
{
    expect(base.WorldTransform()).toStrictEqual(new Transform([1, 0, 0, 1, 10, 20]));
    expect(child.WorldTransform()).toStrictEqual(new Transform([30, 0, 0, 40, 10, 20]));
});