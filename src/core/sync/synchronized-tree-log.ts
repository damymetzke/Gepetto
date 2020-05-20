import * as fs from "fs";
import { SyncMessage, SynchronizedTree } from "./synchronized-tree";

export interface SyncLog
{
    time: Date;
    action: string;
    data: { [key: string]: any; };
}

export class SynchronizedTreeLog extends SynchronizedTree
{
    loggedActions: SyncLog[] = [];

    SendAction(data: SyncMessage)
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