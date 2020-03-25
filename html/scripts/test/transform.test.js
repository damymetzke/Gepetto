const Transform = require("../core/transform");

test("transform", function ()
{
    const base = new Transform([0, 1, 2, 3, 4, 5]);
    const target = new Transform([5, 4, 3, 2, 1, 0]);

    const vector = [10, 20];

    expect(base.matrix).toStrictEqual([0, 1, 2, 3, 4, 5]); //test constructor

    //test lerp
    expect(base.Lerp(target, 0).matrix).toStrictEqual(base.matrix); //minimum progress (base)
    expect(base.Lerp(target, 1).matrix).toStrictEqual(target.matrix); //maximum progress (target)
    expect(base.Lerp(target, 0.5).matrix).toStrictEqual([2.5, 2.5, 2.5, 2.5, 2.5, 2.5]); //50% progress (0.5)
    //pi as progress (0.314)
    {
        const result = base.Lerp(target, 0.314).matrix;
        const expected = [1.57, 1.942, 2.314, 2.686, 3.058, 3.43];
        for (let i = 0; i < 6; ++i)
        {
            expect(result[i]).toBeCloseTo(expected[i]);
        }
    }

    //test multiplications
    expect(base.MultiplyMatrix(target).matrix).toStrictEqual([8, 17, 4, 9, 4, 6]); //matrix
    expect(base.MultiplyVector(vector)).toStrictEqual([44, 75]); //vector


});