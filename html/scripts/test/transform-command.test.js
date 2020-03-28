require("./array-is-close-to-matcher");

const { TransformCommand } = require("../core/transform-command");
const Transform = require("../core/transform");


let translateCommand = new TransformCommand("TRANSLATE", 10, 20);
let scaleCommand = new TransformCommand("SCALE", 30, 40);
let rotateCommand = new TransformCommand("ROTATE", 180, 999);
let shearXCommand = new TransformCommand("SHEARX", 50, 999);
let shearYCommand = new TransformCommand("SHEARY", 999, 60);

test("Translate Command", function ()
{
    const transform = translateCommand.CreateMatrix();
    expect(transform).toStrictEqual(new Transform([1, 0, 0, 1, 10, 20]));

    expect(transform.MultiplyVector([0, 0])).toEqual([10, 20]);
    expect(transform.MultiplyVector([-20, 500])).toEqual([-10, 520]);

});

test("Scale Command", function ()
{
    const transform = scaleCommand.CreateMatrix();
    expect(transform).toStrictEqual(new Transform([30, 0, 0, 40, 0, 0]));

    expect(transform.MultiplyVector([0, 0])).toStrictEqual([0, 0]);
    expect(transform.MultiplyVector([-100, 23])).toStrictEqual([-3000, 920]);
});

test("Rotate Command", function ()
{
    const transform = rotateCommand.CreateMatrix();
    expect(transform.matrix).arrayIsCloseTo(new Transform([-1, 0, 0, -1, 0, 0]).matrix);

    expect(transform.MultiplyVector([1, 0])).arrayIsCloseTo([-1, 0]);
    expect(transform.MultiplyVector([0, 23])).arrayIsCloseTo([0, -23]);
});

test("Shear X Command", function ()
{
    const transform = shearXCommand.CreateMatrix();
    expect(transform).toStrictEqual(new Transform([1, 0, 50, 1, 0, 0]));

    expect(transform.MultiplyVector([0, 2])).toStrictEqual([100, 2]);
    expect(transform.MultiplyVector([10, 5])).toStrictEqual([260, 5]);
});

test("Shear Y Command", function ()
{
    const transform = shearYCommand.CreateMatrix();
    expect(transform).toStrictEqual(new Transform([1, 60, 0, 1, 0, 0]));

    expect(transform.MultiplyVector([2, 0])).toStrictEqual([2, 120]);
    expect(transform.MultiplyVector([5, 10])).toStrictEqual([5, 310]);
});