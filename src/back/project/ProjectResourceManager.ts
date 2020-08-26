import { Serializable } from "../core/core.js";

import * as path from "path";
import { promises as fs } from "fs";

export class ProjectResourceManager
{
    resourcePath: string;
    resource: Serializable;

    constructor (resourcePath: string, resource: Serializable)
    {
        this.resourcePath = resourcePath;
        this.resource = resource;
    }

    async save(projectPath: string): Promise<void>
    {
        const serialized = this.resource.serialize();
        const raw = JSON.stringify(serialized, null, 2);

        const resourcePath = path.join(path.dirname(projectPath), this.resourcePath);
        await fs.writeFile(resourcePath, raw);
    };
    async open(projectPath: string): Promise<void>
    {
        const resourcePath = path.join(path.dirname(projectPath), this.resourcePath);
        const raw = await fs.readFile(resourcePath);

        const serialized = JSON.parse(raw.toString());
        this.resource.deserialize(serialized);
    }
}