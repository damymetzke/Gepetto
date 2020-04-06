const Transform = require("./transform");
const { TransformCommand } = require("./transform-command");

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

    /**
     * should be called whenever transformCommands is changed manually.
     * 
     * when calling this function the object is notified that the transform is dirty.
     * The next time the transform is required it will be recalculated.
     */
    OnTransformCommandsUpdate()
    {
        this._dirty = true;
    }

    get relativeTransform()
    {
        if (!this._dirty)
        {
            return this._relativeTransform;
        }

        this._relativeTransform = new Transform([1, 0, 0, 1, 0, 0]);

        for (let i = 0; i < this.transformCommands.length; ++i)
        {
            let tmp = this.transformCommands[i];
            this._relativeTransform = this.transformCommands[i].CreateMatrix().MultiplyMatrix(this._relativeTransform);
        }

        this._dirty = false;

        return this._relativeTransform;
    }

    /**
     * calculate the world transform of the object.
     * 
     * the relative transform stored in this object is in object-space;
     * in order to get the position on screen it needs to be converted to world space.
     * 
     * to convert it to world space the following operation is done:
     * ```
     * parent.transform * this.transform
     * ```
     * 
     * @see Transform#MultiplyMatrix
     * 
     * @returns the transform of the object in world space.
     */
    WorldTransform()
    {
        if (this.parent === null)
        {
            return this.relativeTransform;
        }
        return this.parent.relativeTransform.MultiplyMatrix(this.relativeTransform);
    }

    ToPureObject()
    {
        result = {
            name: this.name,
            parent: this.parent === null ? null : parent.name,
            transformCommands: []
        };

        for (let i = 0; i < this.transformCommands.length; ++i)
        {
            result.transformCommands.push(this.transformCommands[i].ToPureObject());
        }

        return result;
    }

    FromPureObject(object)
    {
        this.name = object.name;
        this.parent = object.parent;
        this._dirty = true;
        for (let i = 0; i < object.transformCommands.length; ++i)
        {
            let newTransformCommand = new TransformCommand();
            newTransformCommand.FromPureObject(object.transformCommands[i]);
            this.transformCommands.push(newTransformCommand);
        }
    }

    constructor(name, parent = null)
    {
        this.name = name;
        this.parent = parent;
    }
}

module.exports.Transform = Transform;
module.exports.DrawObject = DrawObject;