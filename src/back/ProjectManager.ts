import { Project, DrawObjectTree } from "./core/core.js";

import { promises as fs } from "fs";

import { dialog } from "electron";

export class ProjectManager
{
    projectPath: string;

    project: Project;

    constructor (projectPath: string = "", drawObjectTree: DrawObjectTree = null)
    {
        this.projectPath = projectPath;
        this.project = new Project(drawObjectTree);
    }

    save(): void
    {
        if (!this.projectPath)
        {
            //no file open, automatically use save as
            this.saveAs();
            return;
        }

        const serialized = this.project.serialize();
        const output = JSON.stringify(serialized, null, 2);

        fs.writeFile(this.projectPath, output)
            .catch((error) =>
            {
                dialog.showMessageBox(null, {
                    type: "error",
                    message: `Error writing to file '${this.projectPath}':\n${error}`,
                    title: "Error writing file!"
                });
            });

    }

    saveAs(): void
    {

    }

    open(): void
    {
        if (!this.projectPath)
        {
            //no file open, automatically use open from
            this.openFrom();
            return;
        }

        fs.readFile(this.projectPath)
            .then((content) =>
            {
                const serialized = JSON.parse(content.toString());

                this.project.deserialize(serialized);
            })
            .catch((error) =>
            {
                dialog.showMessageBox(null, {
                    type: "error",
                    message: `Error opening file '${this.projectPath}':\n${error}`,
                    title: "Error opening file!"
                });
            });
    }

    openFrom(): void
    {

    }
}