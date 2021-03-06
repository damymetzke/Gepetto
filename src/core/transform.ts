export type Matrix = [ number, number, number, number, number, number ];
export type Vector = [ number, number ];

/**
 * class that holds a transformation matrix.
 * 
 * while this class holds a transformation matrix,
 * it is meant to abstract this away.
 * this class should be regarded as a transformation, not as a matrix.
 * 
 * matrices are stored in an array as such:
 * ```
 * [a, c, e]
 * [b, d, f]
 * [0, 0, 1]
 * ```
 * a-f are stored in an array of size 6
 * `0, 0, 1` is implied but not actually stored.
 * 
 * @see https://en.wikipedia.org/wiki/Transformation_matrix
 */
export class Transform {

    matrix: Matrix = [1, 0, 0, 1, 0, 0];

    /**
     * @deprecated use {@link Transform.identity} (lower case i) instead.
     */
    static Identity = new Transform();

    static identity (): Transform {

        return new Transform();

    }

    static zero (): Transform {

        return new Transform([0, 0, 0, 0, 0, 0]);

    }

    /**
     * @deprecated use lowercase instead.
     */
    Lerp (target: Transform, progress: number): Transform {

        return this.lerp(target, progress);

    }

    lerp (target: Transform, progress: number): Transform {

        return new Transform([
            this.matrix[0] + (progress * (target.matrix[0] - this.matrix[0])),
            this.matrix[1] + (progress * (target.matrix[1] - this.matrix[1])),
            this.matrix[2] + (progress * (target.matrix[2] - this.matrix[2])),
            this.matrix[3] + (progress * (target.matrix[3] - this.matrix[3])),
            this.matrix[4] + (progress * (target.matrix[4] - this.matrix[4])),
            this.matrix[5] + (progress * (target.matrix[5] - this.matrix[5]))
        ]);

    }

    /**
     * @deprecated use lowercase instead.
     */
    Slerp (target: Transform, progress: number): Transform {

        // todo: implement slerp
        return this.slerp(target, progress);

    }

    // eslint-disable-next-line max-len
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
    slerp (target: Transform, progress: number): Transform {

        // todo: implement slerp
        return new Transform();

    }

    /**
     * @deprecated use Transform.add instead
     * 
     * @param right right hand operator
     */
    MultiplyMatrix (right: Transform): Transform {

        return new Transform([
            (this.matrix[0] * right.matrix[0])
            + (this.matrix[2] * right.matrix[1]),

            (this.matrix[1] * right.matrix[0])
            + (this.matrix[3] * right.matrix[1]),

            (this.matrix[0] * right.matrix[2])
            + (this.matrix[2] * right.matrix[3]),

            (this.matrix[1] * right.matrix[2])
            + (this.matrix[3] * right.matrix[3]),

            (this.matrix[0] * right.matrix[4])
            + (this.matrix[2] * right.matrix[5])
            + this.matrix[4],

            (this.matrix[1] * right.matrix[4])
            + (this.matrix[3] * right.matrix[5])
            + this.matrix[5]
        ]);

    }

    /**
     * @deprecated use lowercase instead.
     */
    Add (next: Transform): Transform {

        return this.add(next);

    }

    /**
     * apply a transform **after** this transform
     * results in a single new transform
     * which is the same as applying this transform first
     * and the next transform second
     * 
     * this function can be chained:
     * ```js
     * a.add(b).add(c);
     * ```
     * which is prefered over using recursive parameters:
     * ```js
     * a.add(b.add(c)); //please do not do this
     * ```
     * 
     * @param next transformation that should be applied next
     * @returns new transform
     */
    add (next: Transform): Transform {

        return new Transform([
            (next.matrix[0] * this.matrix[0])
            + (next.matrix[2] * this.matrix[1]),

            (next.matrix[1] * this.matrix[0])
            + (next.matrix[3] * this.matrix[1]),

            (next.matrix[0] * this.matrix[2])
            + (next.matrix[2] * this.matrix[3]),

            (next.matrix[1] * this.matrix[2])
            + (next.matrix[3] * this.matrix[3]),

            (next.matrix[0] * this.matrix[4])
            + (next.matrix[2] * this.matrix[5])
            + next.matrix[4],

            (next.matrix[1] * this.matrix[4])
            + (next.matrix[3] * this.matrix[5])
            + next.matrix[5]
        ]);

    }

    /**
     * @deprecated use Transform.ApplyToVector instead
     * 
     * @param right right hand side operator
     */
    MultiplyVector (right: Vector): Vector {

        return this.applyToVector(right);

    }

    /**
     * @deprecated use lowercase instead.
     */
    ApplyToVector (vector: Vector): Vector {

        return this.applyToVector(vector);

    }

    /**
     * take a vector and move its position in space based on this transform
     * 
     * @param vector vector which should be transformed
     * @returns a new vector which is the result
     * of applying this transform to the input vector
     */
    applyToVector (vector: Vector): Vector {

        return [
            (this.matrix[0] * vector[0])
            + (this.matrix[2] * vector[1])
            + this.matrix[4],

            (this.matrix[1] * vector[0])
            + (this.matrix[3] * vector[1])
            + this.matrix[5]
        ];

    }

    /**
     * @deprecated use lowercase instead.
     */
    InnerMatrix (): Transform {

        return this.innerMatrix();

    }

    /**
     * get this transform without the translation
     * 
     * the resulting matrix will look like this:
     * ```
     * [a, c, 0]
     * [b, d, 0]
     * [0, 0, 1]
     * ```
     * note that the last 2 numbers in the array are omitted
     * 
     * @returns new transform
     * which is this transform with its translation omitted
     */
    innerMatrix (): Transform {

        return new Transform([
            this.matrix[0],
            this.matrix[1],
            this.matrix[2],
            this.matrix[3],
            0,
            0
        ]);

    }

    /**
     * @deprecated use lowercase instead.
     */
    PositionMatrix (): Transform {

        return this.positionMatrix();

    }

    /**
     * get the only the translation part of this matrix
     * 
     * the resulting matrix will look like this:
     * ```
     * [1, 0, e]
     * [0, 1, f]
     * [0, 0, 1]
     * ```
     * note that the first 4 numbers in the array are omitted
     * 
     * @returns new transform
     * which is exlusively the translation part of this transform
     */
    positionMatrix (): Transform {

        return new Transform([
            1,
            0,
            0,
            1,
            this.matrix[4],
            this.matrix[5]
        ]);

    }

    /**
     * @deprecated use lowercase instead.
     */
    Inverse (): Transform {

        return this.inverse();

    }

    /**
     * get the transform which is the inverse of this transform
     * 
     * any operation done with this transform
     * can be reversed using the inverse transform
     * the following is always true:
     * ```js
     * Transform.Add(Transform.Inverse) = Transform.Identity
     * ```
     */
    inverse (): Transform {

        const determinant = (this.matrix[0] * this.matrix[3])
        - (this.matrix[1] * this.matrix[2]);

        return new Transform([
            this.matrix[3] / determinant,
            this.matrix[1] / -determinant,
            this.matrix[2] / -determinant,
            this.matrix[0] / determinant,

            ((this.matrix[2] * this.matrix[5])
            - (this.matrix[4] * this.matrix[3])) / determinant,

            ((this.matrix[0] * this.matrix[5])
            - (this.matrix[4] * this.matrix[1])) / -determinant
        ]);

    }

    /**
     * @returns a string that can be used
     * inside the 'transform' property of an svg element
     */
    svgString (): string {

        const insideMatrix = this.matrix
            .reduce((
                accumelator,
                current
            ) => `${accumelator} ${current.toString()}`, "");


        return `matrix(${insideMatrix})`;

    }

    constructor (matrix: Matrix = [1, 0, 0, 1, 0, 0]) {

        this.matrix = matrix;

    }

}
