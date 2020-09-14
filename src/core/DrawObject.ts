import {Serializable, SerializeObject} from "./Serializable";
import {SerializedTransformCommand,
    TransformCommand} from "./TransformCommand.js";
import {Transform} from "./transform.js";

export interface SerializedDrawObject extends SerializeObject
{
    name: string;
    parent: string | null;
    transformCommands: SerializedTransformCommand[];
}

const SET_PARENT_ERROR
    = "⚠ setter for 'DrawObject.parent' was called,"
    + "however 'DrawObject._parent' is of type string";

const WORLD_TRANSFORM_ERROR
    = "⚠ tried to call 'DrawObject.WorldTransform'"
    + "with the parent set as a string";

export class DrawObject implements Serializable {

    name: string;

    children: DrawObject[] = [];

    transformCommands: TransformCommand[] = [];

    _relativeTransform: Transform = new Transform();

    _transformDirty = false;

    _parent: DrawObject | string = null;

    set parent (value: DrawObject | string) {

        if (this._parent !== null) {

            if (typeof this._parent === "string") {

                console.warn(SET_PARENT_ERROR);

            } else {

                this._parent.children.splice(
                    this._parent.children.indexOf(this),
                    1
                );

            }

        }

        if (value !== null && typeof value === "object") {

            value.children.push(this);

        }

        this._parent = value;

    }

    get parent (): DrawObject | string {

        return this._parent;

    }

    AddTransformCommand (command: TransformCommand): void {

        this.transformCommands.push(command);
        this._transformDirty = true;

    }

    OnTransformCommandsUpdate (): void {

        this._transformDirty = true;

    }

    get relativeTransform (): Transform {

        if (!this._transformDirty) {

            return this._relativeTransform;

        }

        this._relativeTransform = this.transformCommands.reduce(
            (accumelator, command) => accumelator.Add(command.CreateMatrix()),
            new Transform()
        );

        return this._relativeTransform;

    }

    WorldTransform (): Transform {

        if (this.parent === null) {

            return this.relativeTransform;

        }
        if (typeof this.parent === "string") {

            console.warn(WORLD_TRANSFORM_ERROR);

            return this.relativeTransform;

        }

        return this.relativeTransform.Add(this.parent.WorldTransform());

    }

    /**
     * @deprecated use {@link DrawObject.serialize} instead.
     */
    ToPureObject (): SerializedDrawObject {

        const resultParent = (typeof this.parent === "string"
            || this.parent === null)
            ? <string> this.parent
            : this.parent.name;

        return {
            name: this.name,
            parent: resultParent,
            transformCommands:
            this.transformCommands.map((command) => command.ToPureObject())
        };

    }

    /**
     * @deprecated use {@link DrawObject.serialize} instead.
     */
    FromPureObject (object: SerializedDrawObject): this {

        this.name = object.name;
        this.parent = object.parent;
        this._transformDirty = true;
        this.transformCommands = object.transformCommands
            .map((command) => new TransformCommand().FromPureObject(command));

        return this;

    }

    Clone (recursive = false): DrawObject {

        let parent: string | DrawObject = null;

        if (typeof this.parent === "string") {

            parent = this.parent;

        } else if (recursive) {

            parent = this.parent === null
                ? null
                : this.parent.Clone(true);

        } else {

            parent = this.parent.name;

        }

        return new DrawObject(
            this.name,
            parent,
            this.transformCommands.map((command) => command.Clone())
        );

    }

    constructor (
        name = "",
        parent: string | DrawObject = null,
        transformCommands: TransformCommand[] = []
    ) {

        this.name = name;
        this.parent = parent;
        this.transformCommands = transformCommands;
        if (transformCommands.length > 0) {

            this._transformDirty = true;

        }

    }

    serialize (): SerializedDrawObject {

        return this.ToPureObject();

    }

    deserialize (serialized: SerializedDrawObject): this {

        return this.FromPureObject(serialized);

    }

    reset (): void {

        this.name = "";
        this.parent = null;
        this.transformCommands = [];
        this._relativeTransform = Transform.identity();
        this._transformDirty = false;

    }

}
