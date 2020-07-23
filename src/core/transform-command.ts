import { Transform } from "./transform.js";
import { GepettoExceptionType, GepettoException } from "./gepetto-exception.js";
import { Serializable, SerializeObject } from "./Serializable.js";

type MatrixFunction = (fields: TransformCommandField) => Transform;
export enum TransformCommandType
{
    TRANSLATE,
    SCALE,
    ROTATE,
    SHEARX,
    SHEARY
}
interface TransformCommandField extends SerializeObject
{
    x?: number;
    y?: number;
    rotation?: number;
}
export interface SerializedTransformCommand extends SerializeObject
{
    type: number,
    fields: TransformCommandField;
}

const MATRIX_FUNCTIONS: { [ type in keyof typeof TransformCommandType ]: MatrixFunction; } = {
    "TRANSLATE": (fields) =>
    {
        return new Transform([
            1, 0,
            0, 1,
            fields.x, fields.y
        ]);
    },
    "SCALE": (fields) =>
    {
        return new Transform([
            fields.x, 0,
            0, fields.y,
            0, 0
        ]);
    },
    "ROTATE": (fields) =>
    {
        const rotation = (Number(fields.rotation) * Math.PI) / 180;
        return new Transform([
            Math.cos(rotation), Math.sin(rotation),
            -Math.sin(rotation), Math.cos(rotation),
            0, 0
        ]);
    },
    "SHEARX": (fields) =>
    {
        return new Transform([
            1, 0,
            Number(fields.x), 1,
            0, 0
        ]);
    },
    "SHEARY": (fields) =>
    {
        return new Transform([
            1, Number(fields.y),
            0, 1,
            0, 0
        ]);
    }

};

const FIELD_DEFAULTS: { [ type in keyof typeof TransformCommandType ]: TransformCommandField; } = {
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
    }
};

const RELATIVE_ADDITION_MAP: { [ type in keyof typeof TransformCommandType ]: (first: TransformCommandField, second: TransformCommandField) => TransformCommandField } = {
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

export class TransformCommand implements Serializable
{
    typeIndex: TransformCommandType = TransformCommandType.TRANSLATE;
    fields: TransformCommandField = {};

    set type(value: string)
    {
        this.typeIndex = TransformCommandType[ value ];
    }

    get type(): string
    {
        return TransformCommandType[ this.typeIndex ];
    }

    /**
     * @deprecated use TransformCommand.GetTransform instead
     */
    CreateMatrix(): Transform
    {
        return this.GetTransform();
    }

    GetTransform(): Transform
    {
        return MATRIX_FUNCTIONS[ TransformCommandType[ this.typeIndex ] ](this.fields);
    }

    /**
     * @deprecated use {@link TransformCommand.serialize} instead.
     */
    ToPureObject(): SerializedTransformCommand
    {
        return {
            type: this.typeIndex,
            fields: { ...this.fields }
        };
    }

    /**
     * @deprecated use {@link TransformCommand.deserialize} instead.
     */
    FromPureObject(object: SerializedTransformCommand): this
    {
        this.typeIndex = object.type;
        this.fields = { ...object.fields };
        return this;
    }

    Clone(): TransformCommand
    {
        return new TransformCommand(this.typeIndex, this.fields);
    }

    AddRelative(other: TransformCommand): TransformCommand
    {
        if (this.typeIndex !== other.typeIndex)
        {
            throw new GepettoException(
                GepettoExceptionType.TRANSFORM_COMMAND_TYPE_ERROR,
                `types '${TransformCommandType[ this.typeIndex ]}' and '${TransformCommandType[ other.typeIndex ]}' do not match\n`
            );
        }

        this.fields = { ...RELATIVE_ADDITION_MAP[ TransformCommandType[ this.typeIndex ] ](this.fields, other.fields) };

        return this;
    }

    constructor (type: string | TransformCommandType = "TRANSLATE", fields: TransformCommandField = {})
    {
        const typeIndex: TransformCommandType = (typeof type === "string") ? TransformCommandType[ type ] : type;

        if (!(typeIndex in TransformCommandType))
        {
            throw new GepettoException(
                GepettoExceptionType.TRANSFORM_COMMAND_TYPE_ERROR,
                `enum value '${typeIndex.toString()}' is not a valid transform command type`
            );
        }

        this.typeIndex = typeIndex;
        this.fields = {
            ...FIELD_DEFAULTS[ TransformCommandType[ typeIndex ] ],
            ...fields
        };
    }
    serialize(): SerializeObject
    {
        return this.ToPureObject();
    }
    deserialize(serialized: SerializedTransformCommand): this
    {
        return this.FromPureObject(serialized);
    }
}