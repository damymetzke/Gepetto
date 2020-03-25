const Transform = require("../core/transform");

test("transform", function ()
{
    expect(new Transform([0, 1, 2, 3, 4, 5]).matrix).toStrictEqual([0, 1, 2, 3, 4, 5]);
});