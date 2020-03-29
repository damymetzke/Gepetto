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
    _relativeTransform = new Transform([1, 0, 0, 1, 0, 0]);
    _dirty = false;
    transformCommands = [];
    // transformCommands = onChange({ dirty: false, commands: [] }, function (path, value, previousValue)
    // {
    //     if (path === "commands")
    //     {
    //         this.dirty = true;
    //     }
    // });

    AddTransformCommand(command)
    {
        this.transformCommands.push(command);
        this._dirty = true;
    }

    OnTransformCommandsUpdate()
    {
        this._dirty = true;
    }

    get relativeTransform()
    {
        if (!this._dirty)
        {
            console.log("not dirty");
            return this._relativeTransform;
        }

        this._relativeTransform = new Transform([1, 0, 0, 1, 0, 0]);

        for (let i = 0; i < this.transformCommands.length; ++i)
        {
            let tmp = this.transformCommands[i];
            console.log(typeof tmp.MultiplyMatrix);
            this._relativeTransform = this.transformCommands[i].CreateMatrix().MultiplyMatrix(this._relativeTransform);
        }

        console.log("dirty");
        this._dirty = false;

        return this._relativeTransform;
    }

    WorldTransform()
    {
        if (this.parent === null)
        {
            return this.relativeTransform;
        }
        return this.relativeTransform.MultiplyMatrix(this.parent.relativeTransform);
    }

    constructor(name, parent = null)
    {
        this.name = name;
        this.parent = parent;
    }
}

module.exports.Transform = Transform;
module.exports.DrawObject = DrawObject;