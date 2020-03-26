const Transform = require("../core/transform");

const base = new Transform([0, 1, 2, 3, 4, 5]);
const target = new Transform([5, 4, 3, 2, 1, 0]);
const vector = [10, 20];

expect.extend({
    arrayIsCloseTo(received, array, digits = 2)
    {

        if (!Array.isArray(received))
        {
            return {
                message: function ()
                {
                    return `expected ${received} to be an array`;
                },
                pass: false
            };
        }

        if (!Array.isArray(array))
        {
            return {
                message: function ()
                {
                    return `expected ${array} to be an array`;
                },
                pass: false
            };
        }

        if (!Number.isInteger(digits))
        {
            return {
                message: function ()
                {
                    return `expected ${digits} to be an integer number`;
                },
                pass: false
            };
        }

        if (received.length != array.length)
        {
            return {
                message: function ()
                {
                    return `expected the length of ${received} and ${array} to be the same, however ${received.length} and ${array.length} are not equal`;
                },
                pass: false
            };
        }

        const allowedDifference = 5 * Math.pow(0.1, digits + 1);
        for (let i = 0; i < received.length; ++i)
        {
            difference = Math.abs(received[i] - array[i]);
            if (difference > allowedDifference)
            {
                return {
                    message: function ()
                    {
                        return `expected difference at index ${i}: '${difference}' to be smaller than the allowed difference: '${allowedDifference}'`;
                    },
                    pass: false
                };
            }
        }

        return {
            message: function ()
            {
                return `all elements in ${received} and ${array} are within the allowed difference: '${allowedDifference}'`;
            },
            pass: true
        };
    }
});

test("Transform Construction", function ()
{
    expect(base.matrix).toStrictEqual([0, 1, 2, 3, 4, 5]); //test constructor
});

test("Transform Lerp", function ()
{
    expect(base.Lerp(target, 0).matrix).toStrictEqual(base.matrix); //minimum progress (0) should equal base
    expect(base.Lerp(target, 1).matrix).toStrictEqual(target.matrix); //maximum progress (1) should equal target
    expect(base.Lerp(target, 0.5).matrix).toStrictEqual([2.5, 2.5, 2.5, 2.5, 2.5, 2.5]); //50% progress (0.5)
    expect(base.Lerp(target, 0.314).matrix).arrayIsCloseTo([1.57, 1.942, 2.314, 2.686, 3.058, 3.43]); //test for arbitrary values using PI progress(0.314)
});

test("Transform Matrix Multiplication", function ()
{
    expect(base.MultiplyMatrix(target).matrix).toStrictEqual([8, 17, 4, 9, 4, 6]);
});

test("Transform Vector Multiplication", function ()
{
    expect(base.MultiplyVector(vector)).toStrictEqual([44, 75]);
});;