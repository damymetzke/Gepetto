import { DrawObjectTree } from "./draw-object-tree";
import * as fs from "fs";

const indentText = /\n/g;

interface SyncData
{
    action: string;
    data: { [key: string]: any; };
}

export class SynchronizedObject
{
    objectName: string;
    transformCommandIndex: number;

    owner: SynchronizedTree;

    ChangeName(object: { [key: string]: any; }): void
    {
        this.owner.ChangeName(object);
    }

    constructor(owner: SynchronizedTree, objectName: string, transformCommandIndex: number = -1)
    {
        this.objectName = objectName;
        this.transformCommandIndex = transformCommandIndex;
        this.owner = owner;
    }
}

export class SynchronizedTree
{
    _tree: DrawObjectTree = new DrawObjectTree();

    SendAction(data: SyncData): void
    {
        console.error("❗ SynchronizedTree.SendAction was called, but it is expected to be overridden. Make sure to only instance child classes.");
    }

    ChangeName(object: { [key: string]: any; }): void
    {
        this.SendAction({
            action: "change-name",
            data: object
        });
    }
}

interface SyncLog
{
    time: Date;
    action: string;
    data: { [key: string]: any; };
}

export class SynchronizedTreeLog extends SynchronizedTree
{
    loggedActions: SyncLog[] = [];

    SendAction(data: SyncData)
    {
        this.loggedActions.push({
            time: new Date(Date.now()),
            action: data.action,
            data: data.data
        });
    }

    GetString(): string
    {
        return this.loggedActions.reduce((accumelator: string, log) =>
        {
            return (
                `${accumelator}\n`
                + `@${log.time.toLocaleTimeString()}:\n`
                + `\taction: '${log.action}'\n`
                + `\tdata:${JSON.stringify(log.data, null, 2).replace(/\n/g, "\n\t")}\n`);
        }, "");
    }

    WriteToFile(path: string): void
    {

        fs.writeFile(path, JSON.stringify({ actions: this.loggedActions }, null, 2), () =>
        {

        });
    }
}