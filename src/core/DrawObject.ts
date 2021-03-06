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

    /**
     * @deprecated use lowercase instead.
     */
    AddTransformCommand (command: TransformCommand): void {

        this.addTransformCommand(command);

    }


    addTransformCommand (command: TransformCommand): void {

        this.transformCommands.push(command);
        this._transformDirty = true;

    }

    /**
     * @deprecated use lowercase instead.
     */
    OnTransformCommandsUpdate (): void {

        this.onTransformCommandsUpdate();

    }

    onTransformCommandsUpdate (): void {

        this._transformDirty = true;

    }

    get relativeTransform (): Transform {

        if (!this._transformDirty) {

            return this._relativeTransform;

        }

        this._relativeTransform = this.transformCommands.reduce(
            (accumelator, command) => accumelator.add(command.getTransform()),
            new Transform()
        );

        return this._relativeTransform;

    }


    /**
     * @deprecated use lowercase instead.
     */
    WorldTransform (): Transform {

        return this.worldTransform();

    }

    worldTransform (): Transform {

        if (this.parent === null) {

            return this.relativeTransform;

        }
        if (typeof this.parent === "string") {

            console.warn(WORLD_TRANSFORM_ERROR);

            return this.relativeTransform;

        }

        return this.relativeTransform.add(this.parent.WorldTransform());

    }

    /**
     * @deprecated use {@link DrawObject.serialize} instead.
     */
    ToPureObject (): SerializedDrawObject {

        return this.serialize();

    }

    /**
     * @deprecated use {@link DrawObject.serialize} instead.
     */
    FromPureObject (object: SerializedDrawObject): this {

        return this.deserialize(object);

    }

    /**
     * @deprecated use lowercase instead.
     */
    Clone (recursive = false): DrawObject {

        return this.clone(recursive);

    }

    clone (recursive = false): DrawObject {

        let parent: string | DrawObject = null;

        if (typeof this.parent === "string") {

            parent = this.parent;

        } else if (recursive) {

            parent = this.parent === null
                ? null
                : this.parent.clone(true);

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

    deserialize (serialized: SerializedDrawObject): this {

        this.name = serialized.name;
        this.parent = serialized.parent;
        this._transformDirty = true;
        this.transformCommands = serialized.transformCommands
            .map((command) => new TransformCommand().deserialize(command));

        return this;

    }

    reset (): void {

        this.name = "";
        this.parent = null;
        this.transformCommands = [];
        this._relativeTransform = Transform.identity();
        this._transformDirty = false;

    }

}
