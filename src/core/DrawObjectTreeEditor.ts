import { DrawObjectTree, DrawObjectTreePure } from "./draw-object-tree.js";
import { TransformCommand } from "./transform-command.js";
import { DrawObject } from "./draw-object.js";
import { SyncObject } from "./sync_alt/SyncObject.js";
import { SyncOrganizerType } from "./sync_alt/SyncOrganizer.js";
import { SyncConnector } from "./sync_alt/SyncConnector.js";

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

export interface DrawObjectTreeEditorInterface
{
    AddObject(object: DrawObject): void;
    AddObjectToRoot(object: DrawObject): void;
    HasObject(name: string): boolean;
    ToPureObject(): DrawObjectTreePure;
    FromPureObject(object: DrawObjectTreePure): DrawObjectTree;
    addTransformCommand(object: string, command: TransformCommand): void;
    selectObject(object: string): void;
    validateName(testName: string): verifyResult;
}

export class DrawObjectTreeEditor extends DrawObjectTree implements DrawObjectTreeEditorInterface
{
    selectedObject: string;

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

    constructor (rootObject: DrawObject[] = [])
    {
        super(rootObject);
    }
}

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
    ToPureObject(): DrawObjectTreePure
    {
        return this.under.under.ToPureObject();
    }
    FromPureObject(object: DrawObjectTreePure): DrawObjectTree
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

    constructor (organizerType: SyncOrganizerType, connector: SyncConnector, drawObjectTree: DrawObjectTreeEditor = new DrawObjectTreeEditor())
    {
        this.under = new SyncObject<DrawObjectTreeEditor>(organizerType, connector, drawObjectTree, under => under.ToPureObject(), recieved => <DrawObjectTreeEditor>(new DrawObjectTreeEditor().FromPureObject(recieved)));
    }
}