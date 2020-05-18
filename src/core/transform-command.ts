import { Transform } from "./transform";

type MatrixFunction = () => Transform;
enum TransformCommandType
{
    TRANSLATE,
    SCALE,
    ROTATE,
    SHEARX,
    SHEARY
}
interface TransformCommandField
{
    x?: number;
    y?: number;
    rotation?: number;
}
export interface TransformCommandPure
{
    type: number,
    fields: TransformCommandField;
}

export class TransformCommand
{
    typeIndex: TransformCommandType = TransformCommandType.TRANSLATE;
    fields: TransformCommandField = {};

    set type(value: string)
    {
        this.typeIndex = TransformCommandType[value];
    }

    get type(): string
    {
        return TransformCommandType[this.typeIndex];
    }

    matrixFunctions: { [type in keyof typeof TransformCommandType]: MatrixFunction } = {
        "TRANSLATE": () =>
        {
            return new Transform([
                1, 0,
                0, 1,
                this.fields.x, this.fields.y
            ]);
        },
        "SCALE": () =>
        {
            return new Transform([
                this.fields.x, 0,
                0, this.fields.y,
                0, 0
            ]);
        },
        "ROTATE": () =>
        {
            const rotation = (Number(this.fields.rotation) * Math.PI) / 180;
            return new Transform([
                Math.cos(rotation), Math.sin(rotation),
                -Math.sin(rotation), Math.cos(rotation),
                0, 0
            ]);
        },
        "SHEARX": () =>
        {
            return new Transform([
                1, 0,
                Number(this.fields.x), 1,
                0, 0
            ]);
        },
        "SHEARY": () =>
        {
            return new Transform([
                1, Number(this.fields.y),
                0, 1,
                0, 0
            ]);
        }

    };

    _fieldDefaults: { [type in keyof typeof TransformCommandType]: TransformCommandField } = {
        "TRANSLATE": {
            x: 0,
            y: 0
        },
        "SCALE": {
            x: 1,
            y: 1
        },
        "ROTATE": {
            rotation: 0
        },
        "SHEARX": {
            x: 0
        },
        "SHEARY": {
            y: 0
        },
    };

    /**
     * @deprecated use TransformCommand.GetTransform instead
     */
    CreateMatrix(): Transform
    {
        return this.GetTransform();
    }

    GetTransform(): Transform
    {
        return this.matrixFunctions[TransformCommandType[this.typeIndex]];
    }

    ToPureObject(): TransformCommandPure
    {
        return {
            type: this.typeIndex,
            fields: { ...this.fields }
        };
    }

    FromPureObject(object: TransformCommandPure): TransformCommand
    {
        this.typeIndex = object.type;
        this.fields = { ...object.fields };
        return this;
    }

    Clone(): TransformCommand
    {
        return new TransformCommand(this.typeIndex, this.fields);
    }

    AddRelative(other: TransformCommand): void
    {
        if (this.typeIndex !== other.typeIndex)
        {
            return;
        }

        const addRelativeMap: { [type in keyof typeof TransformCommandType]: (first: TransformCommandField, second: TransformCommandField) => TransformCommandField } = {
            "TRANSLATE": (first, second) =>
            {
                return {
                    x: first.x + second.x,
                    y: first.y + second.y
                };
            },
            "SCALE": (first, second) =>
            {
                return {
                    x: first.x * second.x,
                    y: first.y * second.y
                };
            },
            "ROTATE": (first, second) =>
            {
                let result = first.rotation + second.rotation;
                while (result < 0)
                {
                    result += 360;
                }
                while (result >= 360)
                {
                    result -= 360;
                }
                return {
                    rotation: result
                };
            },
            "SHEARX": (first, second) =>
            {
                return {
                    x: first.x + second.x
                };
            },
            "SHEARY": (first, second) =>
            {
                return {
                    y: first.y + second.y
                };
            }
        };

        this.fields = { ...addRelativeMap[TransformCommandType[this.typeIndex]](this.fields, other.fields) };
    }

    constructor(type: string | TransformCommandType = "TRANSLATE", fields: TransformCommandField = {})
    {
        const typeIndex = (typeof type === "string") ? TransformCommandType[type] : type;
        this.typeIndex = typeIndex;
        this.fields = {
            ...this._fieldDefaults,
            ...fields
        };
    }
}