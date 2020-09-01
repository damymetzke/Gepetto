import { Serializable } from "../core/core.js";

import * as path from "path";
import { promises as fs } from "fs";
import { ProjectManager } from "../ProjectManager.js";

export class ProjectResourceManager
{
    resourcePath: string;
    resource: Serializable;
    project: ProjectManager;

    constructor (resourcePath: string, resource: Serializable, project: ProjectManager)
    {
        this.resourcePath = resourcePath;
        this.resource = resource;
        this.project = project;
    }

    async save(): Promise<void>
    {
        const serialized = this.resource.serialize();
        const raw = JSON.stringify(serialized, null, 2);

        console.log(path.join(path.dirname(this.project.projectPath), this.resourcePath));

        const resourcePath = path.join(path.dirname(this.project.projectPath), this.resourcePath);
        await fs.writeFile(resourcePath, raw);
    };
    async open(): Promise<void>
    {
        const resourcePath = path.join(path.dirname(this.project.projectPath), this.resourcePath);
        const raw = await fs.readFile(resourcePath);

        const serialized = JSON.parse(raw.toString());
        this.resource.deserialize(serialized);
    }

    close()
    {
        if (this.resource.reset)
        {
            this.resource.reset();
        }
    }
}