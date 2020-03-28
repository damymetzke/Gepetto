const { TransformCommand } = require("../core/transform-command");
const Transform = require("../core/transform");


let translateCommand = new TransformCommand("TRANSLATE", 10, 20);
let scaleCommand = new TransformCommand("SCALE", 30, 40);
let rotateCommand = new TransformCommand("ROTATE", 180, 999);
let shearXCommand = new TransformCommand("SHEARX", 50, 999);
let shearYCommand = new TransformCommand("SHEARY", 999, 60);

test("Translate Command", function ()
{
    expect(translateCommand.CreateMatrix()).toStrictEqual(new Transform([1, 0, 0, 1, 10, 20]));
});

test("Scale Command", function ()
{
    expect(scaleCommand.CreateMatrix()).toStrictEqual(new Transform([30, 0, 0, 40, 0, 0]));
});