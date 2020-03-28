const Transform = require("./transform");

class TransformCommand
{
    type = "TRANSLATE";
    x = 0;
    y = 0;

    matrixFunctions =
        {
            TRANSLATE: function ()
            {
                return [
                    1, 0,
                    0, 1,
                    this.x, this.y
                ];
            },
            SCALE: function ()
            {
                return [
                    this.x, 0,
                    0, this.y,
                    0, 0
                ];
            },
            ROTATE: function ()
            {
                return [
                    Math.cos(this.x), Math.sin(this.x),
                    -Math.sin(this.x), Math.cos(this.x),
                    0, 0
                ];
            },
            SHEARX: function ()
            {
                return [
                    1, 0,
                    this.x, 1,
                    0, 0
                ];
            },
            SHEARY: function ()
            {
                return [
                    1, this.y,
                    0, 1,
                    0, 0
                ];
            }
        };

    CreateMatrix()
    {
        return new Transform(this.matrixFunctions[this.type].apply(this, []));
    }

    constructor(type, x, y)
    {
        this.type = type;
        this.x = x;
        this.y = y;
    }
}

module.exports.TransformCommand = TransformCommand;