import { Project, DrawObjectTreeEditorWrapper } from "./core/core.js";

import { promises as fs } from "fs";

import { dialog, app, BrowserWindow } from "electron";

import * as path from "path";
import { file } from "@babel/types";
import { ProjectResourceManager } from "./project/ProjectResourceManager.js";

const USER_CONFIG_PATH = path.join(app.getPath("userData"), "config.json");

export class ProjectManager
{
    projectPath: string;

    project: Project;

    drawObjectTree: ProjectResourceManager;

    window: BrowserWindow;

    constructor (projectPath: string = "", drawObjectTree: DrawObjectTreeEditorWrapper = null, window: BrowserWindow = null)
    {
        this.projectPath = projectPath;
        this.project = new Project();
        this.window = window;

        this.drawObjectTree = new ProjectResourceManager("DrawObjects.gpa",
            drawObjectTree
        );
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

        this.drawObjectTree.save(this.projectPath);

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

    open(path: string = ""): void
    {
        if (path.length > 0)
        {
            this.projectPath = path;
        }

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
                if (this.window)
                {
                    this.window.webContents.send("on-open", {});
                }
            })
            .catch((error) =>
            {
                dialog.showMessageBox(null, {
                    type: "error",
                    message: `Could not open project '${this.projectPath}':\n${error}`,
                    title: "Error opening project!"
                });
            });

        this.drawObjectTree.open(this.projectPath);
    }

    openFrom(): void
    {
        dialog.showOpenDialog(null, {
            title: "Open Project",
            properties: [
                "openFile"
            ],
            filters: [
                {
                    name: "Gepetto Project File",
                    extensions: [ "gpp" ]
                },
                {
                    name: "All File Types",
                    extensions: [ "*" ]
                }
            ]
        })
            .then(({ canceled, filePaths }) =>
            {
                if (canceled)
                {
                    return;
                }

                const [ filePath ] = filePaths;

                this.projectPath = filePath;
                app.addRecentDocument(filePath);
                this.open();
                return Promise.all([
                    fs.readFile(USER_CONFIG_PATH, { flag: "a+" }),
                    Promise.resolve(filePath)
                ]);
            })
            .then(([ data, filePath ]) =>
            {
                let configData;
                try
                {
                    configData = JSON.parse(data.toString());
                }
                catch (_error)
                {
                    configData = {};
                }
                if (!("recentDocuments" in configData))
                {
                    configData.recentDocuments = [];
                }

                if (configData.recentDocuments.every(existingFilePath => existingFilePath !== filePath))
                {
                    configData.recentDocuments.push(filePath);
                    return fs.writeFile(USER_CONFIG_PATH, JSON.stringify(configData));
                }

                return Promise.resolve(null);
            })
            .catch((error) =>
            {
                console.error(`error in project manager:\n${error}`);
            });
    }
}