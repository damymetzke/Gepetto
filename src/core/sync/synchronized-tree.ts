import { DrawObjectTree } from "../draw-object-tree";
import { TransformCommandType, TransformCommand } from "../transform-command";
import { DrawObject } from "../draw-object";
import { SynchronizedObject, SynchronizedTransformCommand } from "./synchronized-object";

type SyncData = { [key: string]: any; };

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

    SendAction(_data: SyncMessage): void
    {
        console.error("❗ SynchronizedTree.SendAction was called, but it is expected to be overridden. Make sure to only instance child classes.");
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
        this.SendAction({
            action: "add-object",
            data: {
                name: name
            }
        });

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
        console.log("🚀 ", object.objectName);
        this._tree.objects[newName] = this._tree.objects[object.objectName];
        delete this._tree.objects[object.objectName];
        this._tree.objects[newName].name = newName;

        this.SendAction({
            action: "change-name",
            data: {
                originalObject: object.objectName,
                newName: newName
            }
        });

        this.NotifyNameChange(object.objectName, newName);
    }

    Reparent(object: SynchronizedObject, newParent: SynchronizedObject): void
    {
        this.SendAction({
            action: "reparent",
            data: {
                child: object.objectName,
                parent: newParent.objectName
            }
        });
    }

    SelectObject(object: SynchronizedObject): void
    {
        this.SendAction({
            action: "select-object",
            data: {
                object: object.objectName,
            }
        });

        this._focus.objectName = object.objectName;
        this._focus.transformCommandIndex = -1;
    }

    AddTransformCommand(object: SynchronizedObject, type: TransformCommandType): void
    {
        this.SendAction({
            action: "add-transform-command",
            data: {
                object: object.objectName,
                type: type
            }
        });

        this._tree.objects[object.objectName].transformCommands.push(new TransformCommand(type));
    }

    RemoveTransformCommand(command: SynchronizedTransformCommand): void
    {
        this.SendAction({
            action: "remove-transform-command",
            data: {
                object: command.objectName,
                command: command.transformCommandIndex
            }
        });
    }

    SelectTransformCommand(command: SynchronizedTransformCommand): void
    {
        this.SendAction({
            action: "select-transform-command",
            data: {
                object: command.objectName,
                command: command.transformCommandIndex
            }
        });
    }
}