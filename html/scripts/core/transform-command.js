const Transform = require("./transform");

/**
 * a single command that is able to build a transformation matrix.
 * 
 * each command can be one of the following types and variables:
 * 
 * - Translate  {x, y}
 * - Scale      {x, y}
 * - Rotate     {rot}
 * - Shear X    {x}
 * - Shear Y    {y}
 * 
 * based on the type and variables a transformation matrix can be created using CreateMatrix.
 * 
 * @see https://en.wikipedia.org/wiki/Transformation_matrix#Examples_in_2_dimensions
 * @see TransformCommand#CreateMatrix
 */
class TransformCommand
{
    type = "TRANSLATE";
    fields = {};

    matrixFunctions =
        {
            TRANSLATE: function ()
            {
                return [
                    1, 0,
                    0, 1,
                    Number(this.fields.x), Number(this.fields.y)
                ];
            },
            SCALE: function ()
            {
                return [
                    Number(this.fields.x), 0,
                    0, Number(this.fields.y),
                    0, 0
                ];
            },
            ROTATE: function ()
            {
                const rotation = (Number(this.fields.rotation) * Math.PI) / 180;
                return [
                    Math.cos(rotation), Math.sin(rotation),
                    -Math.sin(rotation), Math.cos(rotation),
                    0, 0
                ];
            },
            SHEARX: function ()
            {
                return [
                    1, 0,
                    Number(this.fields.x), 1,
                    0, 0
                ];
            },
            SHEARY: function ()
            {
                return [
                    1, Number(this.fields.y),
                    0, 1,
                    0, 0
                ];
            }
        };
    _typeFieldMap = {
        TRANSLATE: {
            x: 0,
            y: 0
        },
        SCALE: {
            x: 1,
            y: 1
        },
        ROTATE: {
            rotation: 0
        },
        SHEARX: {
            x: 0
        },
        SHEARY: {
            y: 0
        }
    };

    /**
     * create a matrix based on the type and variables.
     * 
     * each type creates its matrix using some template which will be filled using the variables.
     * these are the possible templates:
     * 
     * translate:
     * ```
     * ┌ 1.0.x ┐
     * | 0.1.y |
     * └ 0.0.1 ┘
     * ```
     * 
     * scale:
     * ```
     * ┌ x.0.0 ┐
     * | 0.y.0 |
     * └ 0.0.1 ┘
     * ```
     * 
     * rotate:
     * ```
     * ┌ cos(rot).-sin(rot).0 ┐
     * | sin(rot). cos(rot).0 |
     * └ 0       . 0       .1 ┘
     * ```
     * 
     * shear x:
     * ```
     * ┌ 1.x.0 ┐
     * | 0.1.0 |
     * └ 0.0.1 ┘
     * ```
     * 
     * shear y:
     * ```
     * ┌ 1.x.0 ┐
     * | y.1.0 |
     * └ 0.0.1 ┘
     * ```
     * 
     * @see https://en.wikipedia.org/wiki/Transformation_matrix#Examples_in_2_dimensions
     */
    CreateMatrix()
    {
        return new Transform(this.matrixFunctions[this.type].apply(this, []));
    }

    ToPureObject()
    {
        return {
            type: this.type,
            fields: this.fields
        };
    }

    FromPureObject(object)
    {
        this.type = object.type;
        for (let key in object.fields)
        {
            this.fields[key] = object.fields[key];
        }
    }

    Clone()
    {
        return new TransformCommand(this.type, this.fields);
    }

    AddRelative(other)
    {
        if (this.type !== other.type)
        {
            return;
        }

        switch (this.type)
        {
            case "TRANSLATE":
                this.fields.x += other.fields.x;
                this.fields.y += other.fields.y;
                break;
            case "SCALE":
                this.fields.x *= other.fields.x;
                this.fields.y *= other.fields.y;
                break;
            case "ROTATE":
                this.fields.rotation += other.fields.rotation;
                while (this.fields.rotation < 0)
                {
                    this.fields.rotation += 360;
                }
                while (this.fields.rotation >= 360)
                {
                    this.fields.rotation -= 360;
                }
                break;
            case "SHEARX":
                this.fields.x += ither.fields.x;
        }
    }

    constructor(type = "", fields = {})
    {
        this.type = type;
        this.fields = Object.assign(this.fields, (type in this._typeFieldMap) ? this._typeFieldMap[type] : {}, fields);
    }
}

module.exports.TransformCommand = TransformCommand;