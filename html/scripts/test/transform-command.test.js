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