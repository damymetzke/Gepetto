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
    _parent = null;
    children = [];
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

    set parent(value)
    {
        if (this._parent !== null)
        {
            if (typeof this._parent === "string")
            {
                console.warn("⚠ setter for 'DrawObject.parent' was called, however 'DrawObject._parent' is of type string");
            }
            else
            {
                this.parent.children.splice(this.parent.indexOf(this), 1);
            }
        }

        if (value !== null)
        {
            if (typeof value === "object")
            {
                value.children.push(this);
            }
        }

        this._parent = value;
    }

    get parent()
    {
        return this._parent;
    }

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
        if (typeof this.parent === "string")
        {
            console.warn("⚠ tried to call 'DrawObject.WorldTransform' with the parent set as a string");
            return this.relativeTransform;

        }
        return this.parent.relativeTransform.MultiplyMatrix(this.relativeTransform);
    }

    ToPureObject()
    {
        let result = {
            name: this.name,
            parent: this.parent === null ? null : this.parent.name,
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

    Clone(recursiveParents = false)
    {
        let result = new DrawObject(
            this.name,
            this.parent === null ?
                null
                : recursiveParents ?
                    this.parent.Clone(true)
                    : this.parent.name
        );

        result.transformCommands = this.transformCommands.map((command, _index, _array) =>
        {
            return command.Clone();
        });

        return result;
    }

    constructor(name, parent = null)
    {
        this.name = name;
        this.parent = parent;
    }
}

module.exports.Transform = Transform;
module.exports.DrawObject = DrawObject;