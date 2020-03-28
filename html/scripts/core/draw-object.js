const Transform = require("./transform");

/**
 * the class used to store objects to be drawn.
 * 
 * Each object represents an SVG image.
 * Each object has a name, parent and a transform relative to the parent.
 */
class DrawObject
{
    name;
    parent;
    relativeTransform;

    WorldTransform()
    {
        if (this.parent === null)
        {
            return this.relativeTransform;
        }
        return this.relativeTransform.MultiplyMatrix(this.parent.relativeTransform);
    }

    constructor(name, relativeTransform = new Transform(), parent = null)
    {
        this.name = name;
        this.parent = parent;
        this.relativeTransform = relativeTransform;
    }
}

module.exports.Transform = Transform;
module.exports.DrawObject = DrawObject;