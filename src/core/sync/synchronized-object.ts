import { TransformCommandType } from "../transform-command";
import { SynchronizedTree } from "./synchronized-tree";

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
    AddTransformCommand(type: TransformCommandType): SynchronizedTransformCommand
    {
        return this.owner.AddTransformCommand(this, type);
    }

    constructor (owner: SynchronizedTree, objectName: string)
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

    constructor (owner: SynchronizedTree, objectName: string, transformCommandIndex: number)
    {
        super(owner, objectName);
        this.transformCommandIndex = transformCommandIndex;
    }
}