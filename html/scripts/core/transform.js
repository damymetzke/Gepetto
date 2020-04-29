/**
 * fundamental class for all transforms
 * 
 * transforms are a 3x3 matrix in concept, however not all values are saved. The matrix looks like this:
 * ```
 * ┌ a.c.e ┐
 * | b.d.f |
 * └ 0.0.1 ┘
 * ```
 * this matrix can dircetly be used in SVG Transformations.
 */
class Transform
{
    classIdentifier = "Transform";
    matrix = [1, 1, 1, 1, 1, 1];
    /**
     * linear interpolate between this and target.
     * 
     * each value in the matrix is interpolated using the following formula:
     *     this + (progress * (target - this))
     * 
     * @see https://en.wikipedia.org/wiki/Linear_interpolation
     * 
     * @param {Transform} target a transform which will be the end point of the lerp
     * @param {Number} progress a unit value (0.0 - 1.0) which represents the progress of the lerp;
     * 0 represents this transform, 1 represents the target transform.
     */
    Lerp(target, progress)
    {
        if (target.classIdentifier !== "Transform")
        {
            console.error("lerp has been called with a target which is not of type 'Transform':", target);
        }

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
     * the same as lerp, however rather than directly lerping to the end point the rotation is lerped seperately.
     * 
     * the calculation is nearly the same as lerp, however before interpolating the rotation is extracted and interpolated seperately.
     * 
     * @see Transform#Lerp
     * 
     * @param {Transform} target a transform which will be the end point of the slerp
     * @param {Number} progress a unit value (0.0 - 1.0) which represents the progress of the slerp;
     * 0 represents this transform, 1 represents the target transform.
     */
    Slerp(target, progress) { }

    /**
     * a multiplication, or dot product, operation with this on the left and right on the right.
     * 
     * @see https://en.wikipedia.org/wiki/Matrix_multiplication
     * 
     * @param {Transform} right right hand side of the operation
     */
    MultiplyMatrix(right)
    {
        return new Transform([
            this.matrix[0] * right.matrix[0] + this.matrix[2] * right.matrix[1],
            this.matrix[1] * right.matrix[0] + this.matrix[3] * right.matrix[1],
            this.matrix[0] * right.matrix[2] + this.matrix[2] * right.matrix[3],
            this.matrix[1] * right.matrix[2] + this.matrix[3] * right.matrix[3],
            this.matrix[0] * right.matrix[4] + this.matrix[2] * right.matrix[5] + this.matrix[4],
            this.matrix[1] * right.matrix[4] + this.matrix[3] * right.matrix[5] + this.matrix[5],
        ]);
    }
    /**
     * a multiplication, or dot product, operation with this on the left and right on the right.
     * 
     * the right hand side looks like this:
     * ```
     * ┌ x ┐
     * | y |
     * └ 1 ┘
     * ```
     * 
     * @see https://en.wikipedia.org/wiki/Matrix_multiplication
     * 
     * @param {Number[]} right right hand side of the operation.
     */
    MultiplyVector(right)
    {
        return [
            this.matrix[0] * right[0] + this.matrix[2] * right[1] + this.matrix[4],
            this.matrix[1] * right[0] + this.matrix[3] * right[1] + this.matrix[5]
        ];
    }

    InnerMatrix()
    {
        return new Transform([
            this.matrix[0], this.matrix[1],
            this.matrix[2], this.matrix[3],
            0, 0
        ]);
    }

    PositionMatrix()
    {
        return new Transform([
            1, 0,
            0, 1,
            this.matrix[4], this.matrix[5]
        ]);
    }

    Inverse()
    {
        const determinant = (this.matrix[0] * this.matrix[3]) - (this.matrix[1] * this.matrix[2]);

        return new Transform([
            this.matrix[3] / determinant, this.matrix[1] / -determinant,
            this.matrix[2] / -determinant, this.matrix[0] / determinant,
            ((this.matrix[2] * this.matrix[5]) - (this.matrix[4] * this.matrix[3])) / determinant,
            ((this.matrix[0] * this.matrix[5]) - (this.matrix[4] * this.matrix[1])) / -determinant
        ]);
    }

    constructor(matrix = [1, 0, 0, 1, 0, 0])
    {
        this.matrix = matrix;
    }
}

module.exports = Transform;