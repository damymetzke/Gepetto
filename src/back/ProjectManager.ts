import { Project, DrawObjectTree } from "./core/core.js";

import { promises as fs } from "fs";

import { dialog } from "electron";
import { file } from "@babel/types";

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
                    message: `Could not save project '${this.projectPath}':\n${error}`,
                    title: "Error saving project!"
                });
            });

    }

    saveAs(): void
    {
        dialog.showSaveDialog(null, {
            title: "Save Project",
            properties: [
                "createDirectory",
                "showOverwriteConfirmation"
            ]
        })
            .then(({ canceled, filePath }) =>
            {
                if (canceled)
                {
                    return;
                }

                this.projectPath = filePath;
                this.save();
            });
    }

    open(): void
    {
        if (!this.projectPath)
        {
            //no path, don't open anything
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
                    message: `Could not open project '${this.projectPath}':\n${error}`,
                    title: "Error opening project!"
                });
            });
    }

    openFrom(): void
    {

    }
}