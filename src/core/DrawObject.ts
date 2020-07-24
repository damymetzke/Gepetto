import { Transform } from "./transform.js";
import { TransformCommand, SerializedTransformCommand } from "./TransformCommand.js";
import { SerializeObject, Serializable } from "./Serializable";

export interface SerializedDrawObject extends SerializeObject
{
    name: string;
    parent: string | null;
    transformCommands: SerializedTransformCommand[];
}

export class DrawObject implements Serializable
{
    name: string;
    children: DrawObject[] = [];
    transformCommands: TransformCommand[] = [];

    _relativeTransform: Transform = new Transform();
    _transformDirty = false;

    _parent: DrawObject | string = null;

    set parent(value: DrawObject | string)
    {
        if (this._parent !== null)
        {
            if (typeof this._parent === "string")
            {
                console.warn("⚠ setter for 'DrawObject.parent' was called, however 'DrawObject._parent' is of type string");
            }
            else
            {
                this._parent.children.splice(this._parent.children.indexOf(this), 1);
            }
        }

        if (value !== null && typeof value === "object")
        {
            value.children.push(this);
        }

        this._parent = value;
    }

    get parent(): DrawObject | string
    {
        return this._parent;
    }

    AddTransformCommand(command: TransformCommand): void
    {
        this.transformCommands.push(command);
        this._transformDirty = true;
    }

    OnTransformCommandsUpdate(): void
    {
        this._transformDirty = true;
    }

    get relativeTransform(): Transform
    {
        if (!this._transformDirty)
        {
            return this._relativeTransform;
        }

        this._relativeTransform = this.transformCommands.reduce(
            (accumelator, command) => accumelator.Add(command.CreateMatrix()),
            new Transform());

        return this._relativeTransform;
    }

    WorldTransform(): Transform
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

        return this.relativeTransform.Add(this.parent.WorldTransform());
    }

    /**
     * @deprecated use {@link DrawObject.serialize} instead.
     */
    ToPureObject(): SerializedDrawObject
    {
        this.parent;
        return {
            name: this.name,
            parent: this.parent === null ? null : typeof this.parent === "string" ? this.parent : this.parent.name,
            transformCommands: this.transformCommands.map((command) => command.ToPureObject())
        };
    }

    /**
     * @deprecated use {@link DrawObject.serialize} instead.
     */
    FromPureObject(object: SerializedDrawObject): this
    {
        this.name = object.name;
        this.parent = object.parent;
        this._transformDirty = true;
        this.transformCommands = object.transformCommands.map(command => new TransformCommand().FromPureObject(command));

        return this;
    }

    Clone(recursive: boolean = false): DrawObject
    {
        let parent: string | DrawObject = null;
        if (typeof this.parent === "string")
        {
            parent = this.parent;
        }
        else if (recursive)
        {
            parent = this.parent === null ? null : this.parent.Clone(true);
        }
        else
        {
            parent = this.parent.name;
        }

        return new DrawObject(
            this.name,
            parent,
            this.transformCommands.map(command => command.Clone())
        );
    }

    constructor (name: string = "", parent: string | DrawObject = null, transformCommands: TransformCommand[] = [])
    {
        this.name = name;
        this.parent = parent;
        this.transformCommands = transformCommands;
        if (transformCommands.length > 0)
        {
            this._transformDirty = true;
        }
    }
    serialize(): SerializeObject
    {
        return this.ToPureObject();
    }
    deserialize(serialized: SerializedDrawObject): this
    {
        return this.FromPureObject(serialized);
    }
}