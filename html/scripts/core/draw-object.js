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
    _parent;
    relativeTransform;

    children = [];

    WorldTransform()
    {
        if (this.parent === null)
        {
            return this.relativeTransform;
        }
        return this.relativeTransform.MultiplyMatrix(this.parent.relativeTransform);
    }

    set parent(value)
    {
        if (this._parent !== null)
        {
            this._parent.children.splice(this._parent.children.find(this), 1);
        }
        this._parent = value;
        value.children.push(this);
    }

    get parent()
    {
        return this._parent;
    }

    HasObject(name)
    {
        if (name === this.name)
        {
            return true;
        }

        for (let i = 0; i < this.children.length; ++i)
        {
            if (this.children[i].HasObject(name))
            {
                return true;
            }
        }

        return false;
    }

    constructor(name, relativeTransform = new Transform(), parent = null)
    {
        this.name = name;
        this._parent = parent;
        this.relativeTransform = relativeTransform;
    }
}

module.exports.Transform = Transform;
module.exports.DrawObject = DrawObject;