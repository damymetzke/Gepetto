const Transform = require("./transform");

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