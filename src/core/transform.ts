type Matrix = [number, number, number, number, number, number];
type Vector = [number, number];

export class Transform
{
    matrix: Matrix = [1, 0, 0, 1, 0, 0];

    Lerp(target: Transform, progress: number): Transform
    {
        return new Transform([
            this.matrix[0] + (progress * (target.matrix[0] - this.matrix[0])),
            this.matrix[1] + (progress * (target.matrix[1] - this.matrix[1])),
            this.matrix[2] + (progress * (target.matrix[2] - this.matrix[2])),
            this.matrix[3] + (progress * (target.matrix[3] - this.matrix[3])),
            this.matrix[4] + (progress * (target.matrix[4] - this.matrix[4])),
            this.matrix[5] + (progress * (target.matrix[5] - this.matrix[5]))
        ]);
    }

    Slerp(target: Transform, progress: number): Transform
    {
        //todo: implement slerp
        return new Transform();
    }

    /**
     * @deprecated use Transform.Add instead
     * 
     * @param right right hand operator
     */
    MultiplyMatrix(right: Transform): Transform
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

    Add(next: Transform): Transform
    {
        return new Transform([
            next.matrix[0] * this.matrix[0] + next.matrix[2] * this.matrix[1],
            next.matrix[1] * this.matrix[0] + next.matrix[3] * this.matrix[1],
            next.matrix[0] * this.matrix[2] + next.matrix[2] * this.matrix[3],
            next.matrix[1] * this.matrix[2] + next.matrix[3] * this.matrix[3],
            next.matrix[0] * this.matrix[4] + next.matrix[2] * this.matrix[5] + next.matrix[4],
            next.matrix[1] * this.matrix[4] + next.matrix[3] * this.matrix[5] + next.matrix[5],
        ]);
    }

    /**
     * @deprecated use Transform.ApplyToVector instead
     * 
     * @param right right hand side operator
     */
    MultiplyVector(right: Vector): Vector
    {
        return this.ApplyToVector(right);
    }

    ApplyToVector(vector: Vector): Vector
    {
        return [
            this.matrix[0] * vector[0] + this.matrix[2] * vector[1] + this.matrix[4],
            this.matrix[1] * vector[0] + this.matrix[3] * vector[1] + this.matrix[5]
        ];
    }

    InnerMatrix(): Transform
    {
        return new Transform([
            this.matrix[0], this.matrix[1],
            this.matrix[2], this.matrix[3],
            0, 0
        ]);
    }

    PositionMatrix(): Transform
    {
        return new Transform([
            1, 0,
            0, 1,
            this.matrix[4], this.matrix[5]
        ]);
    }

    Inverse(): Transform
    {
        const determinant = (this.matrix[0] * this.matrix[3]) - (this.matrix[1] * this.matrix[2]);

        return new Transform([
            this.matrix[3] / determinant, this.matrix[1] / -determinant,
            this.matrix[2] / -determinant, this.matrix[0] / determinant,
            ((this.matrix[2] * this.matrix[5]) - (this.matrix[4] * this.matrix[3])) / determinant,
            ((this.matrix[0] * this.matrix[5]) - (this.matrix[4] * this.matrix[1])) / -determinant
        ]);
    }

    constructor(matrix: Matrix = [1, 0, 0, 1, 0, 0])
    {
        this.matrix = matrix;
    }
}