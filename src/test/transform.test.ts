import "./shared";
import {Transform, Vector} from "./core/core";


const TARGET_FILE = "core/transform.ts";

test(`CLASS_CONSTRUCTOR Transform @ '${TARGET_FILE}'`, () => {

    const transform = new Transform([2232, 3474, 5322, 6506, 8831, 1363]);

    expect(transform.matrix).toStrictEqual([
        2232,
        3474,
        5322,
        6506,
        8831,
        1363
    ]);

});

test(`CLASS_FUNCTION Transform.Lerp @ '${TARGET_FILE}'`, () => {

    // initial values
    const a = new Transform([8731, 814, 3671, 6686, 6473, 785]);
    const b = new Transform([6584, 1152, 7148, 7626, 5636, 3361]);

    // lerped derivatives
    const min = a.lerp(b, 0);
    const max = a.lerp(b, 1);
    const random = a.lerp(b, 0.277);

    // test
    expect(min).toEqualTransform(a);
    expect(max).toEqualTransform(b);
    expect(random).toEqualTransform(new Transform([
        8136.281,
        907.626,
        4634.129,
        6946.380,
        6241.151,
        1498.552
    ]));

});

test(`CLASS_FUNCTION Transform.Add @ '${TARGET_FILE}'`, () => {

    // initial values
    const first = new Transform([3974, 7035, 7115, 8302, 1720, 7610]);
    const last = new Transform([2669, 3831, 6093, 8222, 8655, 522]);

    // added derivative
    const added = first.add(last);

    // test
    expect(added).toEqualTransform(new Transform([
        53470861,
        73066164,
        69574021,
        95516609,
        50967065,
        69159262
    ]));

});

test(`CLASS_FUNCTION Transform.ApplyVector @ '${TARGET_FILE}'`, () => {

    const transform = new Transform([4225, 2547, 3098, 1171, 1858, 7919]);
    const vector: Vector = [8666, 5015];

    // applied derivative
    const appliedVector = transform.applyToVector(vector);

    // test
    expect(appliedVector[0]).toBeCloseTo(52152178);
    expect(appliedVector[1]).toBeCloseTo(27952786);

});

test(`CLASS_FUNCTION Transform.InnerMatrix @ '${TARGET_FILE}'`, () => {

    // values
    const transform = new Transform([8189, 4878, 5721, 6101, 8356, 4162]);

    // function
    const inner = transform.innerMatrix();

    // test
    expect(inner).toEqualTransform(new Transform([
        8189,
        4878,
        5721,
        6101,
        0,
        0
    ]));

});

test(`CLASS_FUNCTION Transform.PositionMatrix @ '${TARGET_FILE}'`, () => {

    // values
    const transform = new Transform([6926, 2941, 7536, 4507, 9892, 5796]);

    // function
    const position = transform.positionMatrix();

    // test
    expect(position).toEqualTransform(new Transform([
        1,
        0,
        0,
        1,
        9892,
        5796
    ]));

});

test(`CLASS_FUNCTION Transform.Inverse @ '${TARGET_FILE}'`, () => {

    // values
    const transform = new Transform([24, 60, 93, 20, 35, 69]);

    // function
    const inverse = transform.inverse();

    // test
    expect(inverse).toEqualTransform(new Transform([
        -0,
        0.01,
        0.02,
        -0,
        -1.12,
        -0.09
    ]));

});
