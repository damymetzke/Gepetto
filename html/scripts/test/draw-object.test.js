const { DrawObject, Transform } = require("../core/draw-object");

const base = new DrawObject("Base", new Transform([0, 1, 2, 3, 4, 5]));
const child = new DrawObject("Child", new Transform([5, 4, 3, 2, 1, 0]), base);

test("DrawObject Constructor", function ()
{
    //base
    expect(base.name).toStrictEqual("Base");
    expect(base.parent).toBeNull();
    expect(base.relativeTransform).toStrictEqual(new Transform([0, 1, 2, 3, 4, 5]));

    //child
    expect(child.name).toStrictEqual("Child");
    expect(child.parent).toBe(base);
    expect(child.relativeTransform).toStrictEqual(new Transform([5, 4, 3, 2, 1, 0]));
});

test("DrawObject WorldTransform", function ()
{
    expect(base.WorldTransform()).toStrictEqual(new Transform([0, 1, 2, 3, 4, 5]));
    expect(child.WorldTransform()).toStrictEqual(new Transform([3, 2, 19, 14, 36, 26]));
});