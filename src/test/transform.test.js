require("./array-is-close-to-matcher");

import Transform from "./core/transform";

const base = new Transform([0, 1, 2, 3, 4, 5]);
const target = new Transform([5, 4, 3, 2, 1, 0]);
const vector = [10, 20];

const baseInverse = base.Inverse();
const targetInverse = target.Inverse();

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

test("Inverse Matrix", () =>
{
    expect(baseInverse.matrix).arrayIsCloseTo([-1.5, 0.5, 1, 0, 1, -2]);
    expect(targetInverse.matrix).arrayIsCloseTo([-1, 2, 1.5, -2.5, 1, -2]);

    expect(baseInverse.MultiplyMatrix(base).matrix).arrayIsCloseTo([1, 0, 0, 1, 0, 0]);
    expect(targetInverse.MultiplyMatrix(target).matrix).arrayIsCloseTo([1, 0, 0, 1, 0, 0]);

    expect(base.MultiplyMatrix(baseInverse).matrix).arrayIsCloseTo([1, 0, 0, 1, 0, 0]);
    expect(target.MultiplyMatrix(targetInverse).matrix).arrayIsCloseTo([1, 0, 0, 1, 0, 0]);
});