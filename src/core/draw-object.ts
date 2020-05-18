import { Transform } from "./transform";
import { TransformCommand, TransformCommandPure } from "./transform-command";

export interface DrawObjectPure
{
    name: string;
    parent: string | null;
    transformCommands: TransformCommandPure[];
}

export class DrawObject
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

    ToPureObject(): DrawObjectPure
    {
        this.parent;
        return {
            name: this.name,
            parent: this.parent === null ? null : typeof this.parent === "string" ? this.parent : this.parent.name,
            transformCommands: this.transformCommands.map((command) => command.ToPureObject())
        };
    }

    FromPureObject(object: DrawObjectPure): DrawObject
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
            parent = this.parent.Clone(true);
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

    constructor(name: string = "", parent: string | DrawObject = null, transformCommands: TransformCommand[] = [])
    {
        this.name = name;
        this.parent = parent;
        this.transformCommands = transformCommands;
    }
}