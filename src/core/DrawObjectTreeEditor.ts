import { DrawObjectTree, DrawObjectTreePure } from "./draw-object-tree";
import { TransformCommand } from "./transform-command";
import { DrawObject } from "./draw-object";
import { SyncObject } from "./sync_alt/SyncObject";
import { SyncOrganizerType } from "./sync_alt/SyncOrganizer";
import { SyncConnector } from "./sync_alt/SyncConnector";

export interface DrawObjectTreeEditorInterface
{
    AddObject(object: DrawObject): void;
    AddObjectToRoot(object: DrawObject): void;
    HasObject(name: string): boolean;
    ToPureObject(): DrawObjectTreePure;
    FromPureObject(object: DrawObjectTreePure): DrawObjectTree;
    addTransformCommand(object: string, command: TransformCommand): void;
    selectObject(object: string): void;
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

    constructor (organizerType: SyncOrganizerType, connector: SyncConnector, drawObjectTree: DrawObjectTreeEditor = new DrawObjectTreeEditor())
    {
        this.under = new SyncObject<DrawObjectTreeEditor>(organizerType, connector, drawObjectTree, under => under.ToPureObject(), recieved => <DrawObjectTreeEditor>(new DrawObjectTreeEditor().FromPureObject(recieved)));
    }
}