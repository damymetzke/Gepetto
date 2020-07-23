import { DrawObjectTree, SerializedDrawObjectTree } from "./draw-object-tree.js";
import { TransformCommand } from "./transform-command.js";
import { DrawObject } from "./draw-object.js";
import { SyncObject } from "./sync_alt/SyncObject.js";
import { SyncOrganizerType } from "./sync_alt/SyncOrganizer.js";
import { SyncConnector } from "./sync_alt/SyncConnector.js";
import { Serializable, SerializeObject } from "./Serializable.js";

const REGEX_VALIDATE_IMPORT_NAME = /^[a-z][a-z0-9_]*$/i;

type verifyResult =
    {
        success: true;
    }
    |
    {
        success: false;
        message: string;
    };

/**
 * @see DrawObjectTreeEditor
 */
export interface DrawObjectTreeEditorInterface extends Serializable
{
    AddObject(object: DrawObject): void;
    AddObjectToRoot(object: DrawObject): void;
    HasObject(name: string): boolean;
    ToPureObject(): SerializedDrawObjectTree;
    FromPureObject(object: SerializedDrawObjectTree): DrawObjectTree;
    addTransformCommand(object: string, command: TransformCommand): void;
    selectObject(object: string): void;
    validateName(testName: string): verifyResult;
    renameObject(object: string, newName: string): void;
    updateTransformCommandField(object: string, command: number, field: string, value: number): void;
}

export class DrawObjectTreeEditor extends DrawObjectTree implements DrawObjectTreeEditorInterface
{
    selectedObject: string;

    AddObject(object: DrawObject): void
    {
        super.AddObject(object);
        this.selectedObject = object.name;
    }

    AddObjectToRoot(object: DrawObject): void
    {
        super.AddObjectToRoot(object);
        this.selectedObject = object.name;
    }

    addTransformCommand(object: string, command: TransformCommand): void
    {
        if (!(object in this.objects))
        {
            console.warn(`attempt to add command to DrawObjectTreeController failed because ${object} does not exist`);
        }

        this.objects[ object ].AddTransformCommand(command);
    }

    selectObject(object: string)
    {
        this.selectedObject = object;
    }

    validateName(testName: string): verifyResult
    {
        if (!testName)
        {
            return {
                success: false,
                message: "Name cannot be empty"
            };
        }

        if (!REGEX_VALIDATE_IMPORT_NAME.test(testName))
        {
            return {
                success: false,
                message: "Name can only contain alphanumerical characters and underscore('_')\nName should always start with an alphabetic character (a-z)"
            };
        }

        if (this.HasObject(testName))
        {
            return {
                success: false,
                message: "Name is already in use"
            };
        }

        return {
            success: true
        };
    }

    renameObject(object: string, newName: string): void
    {
        if (object === newName)
        {
            return;
        }

        if (!this.validateName(newName).success)
        {
            return;
        }

        this.objects[ object ].name = newName;
        this.objects[ newName ] = this.objects[ object ];
        delete this.objects[ object ];

        if (this.selectedObject === object)
        {
            this.selectedObject = newName;
        }
    }

    updateTransformCommandField(object: string, command: number, field: string, value: number): void
    {
        if (!(object in this.objects))
        {
            return;
        }

        const targetObject = this.objects[ object ];

        if (command >= targetObject.transformCommands.length)
        {
            return;
        }

        const targetCommand = targetObject.transformCommands[ command ];

        targetCommand.fields[ field ] = value;
    }

    constructor (rootObject: DrawObject[] = [])
    {
        super(rootObject);
    }
}

/**
 * wrapper function for object synchonization
 * 
 * @see DrawObjectTreeEditor
 * @see SyncObject
 */
export class DrawObjectTreeEditorWrapper implements DrawObjectTreeEditorInterface
{
    under: SyncObject<DrawObjectTreeEditor>;

    AddObject(object: DrawObject): void
    {
        this.under.runAction({ action: "AddObject", argumentList: [ object ] });
    }
    AddObjectToRoot(object: DrawObject): void
    {
        this.under.runAction({ action: "AddObjectToRoot", argumentList: [ object ] });
    }
    HasObject(name: string): boolean
    {
        return this.under.under.HasObject(name);
    }
    ToPureObject(): SerializedDrawObjectTree
    {
        return this.under.under.ToPureObject();
    }
    FromPureObject(object: SerializedDrawObjectTree): DrawObjectTree
    {
        this.under.runAction({ action: "FromPureObject", argumentList: [ object ] });
        return this.under.under;
    }

    addTransformCommand(object: string, command: TransformCommand): void
    {
        this.under.runAction({ action: "addTransformCommand", argumentList: [ object, command ] });
    }
    selectObject(object: string): void
    {
        this.under.runAction({ action: "selectObject", argumentList: [ object ] });
    }

    validateName(testName: string): verifyResult
    {
        return this.under.under.validateName(testName);
    }

    renameObject(object: string, newName: string): void
    {
        this.under.runAction({ action: "renameObject", argumentList: [ object, newName ] });
    }

    updateTransformCommandField(object: string, command: number, field: string, value: number): void
    {
        this.under.runAction({ action: "updateTransformCommandField", argumentList: [ object, command, field, value ] });
    }

    constructor (organizerType: SyncOrganizerType, connector: SyncConnector, drawObjectTree: DrawObjectTreeEditor = new DrawObjectTreeEditor())
    {
        this.under = new SyncObject<DrawObjectTreeEditor>(organizerType, connector, drawObjectTree, under => under.ToPureObject(), recieved => <DrawObjectTreeEditor>(new DrawObjectTreeEditor().FromPureObject(recieved)), {
            "AddObjectToRoot": {
                ConvertToSend: argumentList => [ (<DrawObject>argumentList[ 0 ]).ToPureObject() ],
                ConvertFromSend: argumentList => [ new DrawObject().FromPureObject(argumentList[ 0 ]) ]
            },
            "addTransformCommand": {
                ConvertToSend: argumentList => [ argumentList[ 0 ], (<TransformCommand>argumentList[ 1 ]).ToPureObject() ],
                ConvertFromSend: argumentList => [ argumentList[ 0 ], new TransformCommand().FromPureObject(argumentList[ 1 ]) ]
            }
        });
    }
    serialize(): SerializeObject
    {
        return this.under.under.serialize();
    }
    deserialize(serialized: SerializeObject): this
    {
        this.under.runAction({ action: "deserialize", argumentList: [ serialized ] });
        return this;
    }
}