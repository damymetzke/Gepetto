import { DrawObjectTree } from "../draw-object-tree";
import { TransformCommandType } from "../transform-command";
import { DrawObject } from "../draw-object";

export interface SyncData
{
    action: string;
    data: { [key: string]: any; };
}

export class SynchronizedObject
{
    objectName: string;

    owner: SynchronizedTree;

    ChangeName(newName: string): void
    {
        this.owner.ChangeName(this, newName);
    }
    Reparent(newParent: SynchronizedObject): void
    {
        this.owner.Reparent(this, newParent);
    }
    Select(): void
    {
        this.owner.SelectObject(this);
    }
    AddTransformCommand(type: TransformCommandType): void
    {
        this.owner.AddTransformCommand(this, type);
    }

    constructor(owner: SynchronizedTree, objectName: string)
    {
        this.objectName = objectName;
        this.owner = owner;
    }
}

export class SynchronizedTransformCommand extends SynchronizedObject
{
    transformCommandIndex: number;

    Remove(): void
    {
        this.owner.RemoveTransformCommand(this);
    }

    SelectCommand(): void
    {
        this.owner.SelectTransformCommand(this);
    }

    constructor(owner: SynchronizedTree, objectName: string, transformCommandIndex: number)
    {
        super(owner, objectName);
        this.transformCommandIndex = transformCommandIndex;
    }
}

export class SynchronizedTree
{
    _tree: DrawObjectTree = new DrawObjectTree();

    _followedSynchronizedObjects: { [name: string]: SynchronizedObject[]; } = {};

    SendAction(_data: SyncData): void
    {
        console.error("❗ SynchronizedTree.SendAction was called, but it is expected to be overridden. Make sure to only instance child classes.");
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

        if (object.objectName in this._followedSynchronizedObjects)
        {
            this._followedSynchronizedObjects[newName] = this._followedSynchronizedObjects[object.objectName];
            this._followedSynchronizedObjects[newName].forEach(followed =>
            {
                followed.objectName = newName;
            });
        }
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