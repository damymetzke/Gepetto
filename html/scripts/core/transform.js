class Transform
{
    classIdentifier = "Transform";
    matrix = [1, 1, 1, 1, 1, 1];

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
    Slerp(target, progress) { }

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
    MultiplyVector(right)
    {
        return [
            this.matrix[0] * right[0] + this.matrix[2] * right[1] + this.matrix[4],
            this.matrix[1] * right[0] + this.matrix[3] * right[1] + this.matrix[5]
        ];
    }

    constructor(matrix)
    {
        this.matrix = matrix;
    }
}

module.exports = Transform;