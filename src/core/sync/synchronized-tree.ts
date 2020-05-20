import { DrawObjectTree } from "../draw-object-tree";
import { TransformCommandType, TransformCommand } from "../transform-command";
import { DrawObject } from "../draw-object";
import { SynchronizedObject, SynchronizedTransformCommand } from "./synchronized-object";

export type SyncData = { [key: string]: any; };
type RecieveActionListner = (action: string, data: SyncData) => void;
type ActionListner = (data: SyncData, result: any) => void;

//action data interfaces
interface ChangeNameData
{
    originalObject: string,
    newName: string;
}

const ACTION_EFFECTS: { [action: string]: (syncTree: SynchronizedTree, data: SyncData) => any; } = {
    "change-name": (syncTree: SynchronizedTree, data: ChangeNameData) =>
    {
        syncTree._tree.objects[data.newName] = syncTree._tree.objects[data.originalObject];
        delete syncTree._tree.objects[data.originalObject];
        syncTree._tree.objects[data.newName].name = data.newName;

        syncTree.NotifyNameChange(data.originalObject, data.newName);

        return syncTree._tree.objects[data.newName];
    }
};

export interface SyncMessage
{
    action: string;
    data: SyncData;
}

export class SynchronizedTree
{
    _tree: DrawObjectTree = new DrawObjectTree();

    _followedSynchronizedObjects: { [name: string]: SynchronizedObject[]; } = {};
    _focus: SynchronizedTransformCommand = new SynchronizedTransformCommand(this, "", -1);

    _recieveActionListners: RecieveActionListner[] = [];
    _actionListners: { [action: string]: ActionListner[]; } = {};

    SendAction(_action: string, _data: SyncData): void
    {
        console.error("❗ SynchronizedTree.SendAction was called, but it is expected to be overridden. Make sure to only instance child classes.");
    }

    RecieveAction(action: string, data: SyncData): void
    {
        this._recieveActionListners.forEach(listner =>
        {
            listner(action, data);
        });

        if (!(action in ACTION_EFFECTS))
        {
            return;
        }

        const result = ACTION_EFFECTS[action](this, data);

        if (!(action in this._actionListners))
        {
            return;
        }

        this._actionListners[action].forEach(listner => listner(data, result));
    }

    AddRecieveActionListner(listner: RecieveActionListner)
    {
        this._recieveActionListners.push(listner);
    }

    AddActionListner(action: string, listner: ActionListner)
    {
        if (!(action in this._actionListners))
        {
            this._actionListners[action] = [listner];
            return;
        }

        this._actionListners[action].push(listner);
    }

    NotifyNameChange(name: string, newName: string)
    {
        if (name in this._followedSynchronizedObjects)
        {
            this._followedSynchronizedObjects[newName] = this._followedSynchronizedObjects[name];
            delete this._followedSynchronizedObjects[name];
            this._followedSynchronizedObjects[newName].forEach(followed =>
            {
                followed.objectName = newName;
            });
        }

        if (this._focus.objectName === name)
        {
            this._focus.objectName = newName;
        }
    }

    Focus(): SynchronizedTransformCommand
    {
        return this._focus;
    }

    AddObject(name: string): SynchronizedObject
    {
        this._tree.objects[name] = new DrawObject(name);
        this._tree.rootObjects.push(this._tree.objects[name]);
        this.SendAction("add-object", { name: name });

        let result = new SynchronizedObject(this, name);
        if (!(name in this._followedSynchronizedObjects))
        {
            this._followedSynchronizedObjects[name] = [];
        }
        this._followedSynchronizedObjects[name].push(result);
        return result;
    }

    ChangeName(object: SynchronizedObject, newName: string): void
    {
        this._tree.objects[newName] = this._tree.objects[object.objectName];
        delete this._tree.objects[object.objectName];
        this._tree.objects[newName].name = newName;

        this.SendAction("change-name", {
            originalObject: object.objectName,
            newName: newName
        });

        this.NotifyNameChange(object.objectName, newName);
    }

    Reparent(object: SynchronizedObject, newParent: SynchronizedObject): void
    {
        this.SendAction("reparent", {
            child: object.objectName,
            parent: newParent.objectName
        });
    }

    SelectObject(object: SynchronizedObject): void
    {
        this.SendAction("select-object", { object: object.objectName });

        this._focus.objectName = object.objectName;
        this._focus.transformCommandIndex = -1;
    }

    AddTransformCommand(object: SynchronizedObject, type: TransformCommandType): void
    {
        this.SendAction("add-transform-command", {
            object: object.objectName,
            type: type
        });

        this._tree.objects[object.objectName].transformCommands.push(new TransformCommand(type));
    }

    RemoveTransformCommand(command: SynchronizedTransformCommand): void
    {
        this.SendAction("remove-transform-command", {
            object: command.objectName,
            command: command.transformCommandIndex
        });
    }

    SelectTransformCommand(command: SynchronizedTransformCommand): void
    {
        this.SendAction("select-transform-command", {
            object: command.objectName,
            command: command.transformCommandIndex
        });
    }
}