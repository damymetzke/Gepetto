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
    x = 0;
    y = 0;

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
                const rotation = (Number(this.fields.x) * Math.PI) / 180;
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
        this.fields = object.fields;
    }

    constructor(type, x, y)
    {
        this.type = type;
        this.fields = {
            x: x,
            y: y
        };
    }
}

module.exports.TransformCommand = TransformCommand;