import * as path from "path";
import {BrowserWindow, app, dialog, ipcMain} from "electron";
import {DrawObjectTreeEditorWrapper, Project} from "./core/core.js";
import {ProjectResourceManager} from "./project/ProjectResourceManager.js";
import {promises as fs} from "fs";


const USER_CONFIG_PATH = path.join(app.getPath("userData"), "config.json");

type SaveTabData =
    {
        type: "draw-object-tree";
    }
    |
    {
        type: "key-frame" | "animation";
        name: string;
    };

export class ProjectManager {

    projectPath: string;

    project: Project;

    drawObjectTreeUnder: DrawObjectTreeEditorWrapper;

    drawObjectTree: ProjectResourceManager;

    window: BrowserWindow;

    constructor (
        projectPath = "",
        drawObjectTree: DrawObjectTreeEditorWrapper = null,
        window: BrowserWindow = null
    ) {

        this.projectPath = projectPath;
        this.project = new Project();
        this.window = window;

        this.drawObjectTreeUnder = drawObjectTree;
        this.drawObjectTree = null;

        ipcMain.on("save-tab", (_event, data: SaveTabData) => {

            switch (data.type) {

            case "draw-object-tree":
                console.log("saving draw-object-tree");
                this.drawObjectTree.save()
                    .then(() => {

                        this.drawObjectTreeUnder.notifySave();

                    });
                break;
            default:
                break;

            }

        });

        ipcMain.on("open-object-editor", () => {

            this.openObjectEditor();

        });
        ipcMain.on("close-object-editor", () => {

            this.closeObjectEditor();

        });

    }

    save (): void {

        if (!this.projectPath) {

            // no file open, automatically use save as
            this.saveAs();

            return;

        }

        const serialized = this.project.serialize();
        const output = JSON.stringify(serialized, null, 2);

        fs.writeFile(this.projectPath, output)
            .catch((error) => {

                dialog.showMessageBox(null, {
                    type: "error",
                    message:
                    `Could not save project '${this.projectPath}':\n${error}`,
                    title: "Error saving project!"
                });

            });

        if (this.drawObjectTree) {

            this.drawObjectTree.save();

        }
        this.drawObjectTreeUnder.notifySave();

    }

    saveAs (): void {

        dialog.showSaveDialog(null, {
            title: "Save Project",
            properties: [
                "createDirectory",
                "showOverwriteConfirmation"
            ]
        })
            .then(({canceled, filePath}) => {

                if (canceled) {

                    return;

                }

                this.projectPath = filePath;
                this.save();

            });

    }

    open (openPath = ""): void {

        if (openPath.length > 0) {

            this.projectPath = openPath;

        }

        if (!this.projectPath) {

            // no path, don't open anything
            return;

        }

        fs.readFile(this.projectPath)
            .then((content) => {

                const serialized = JSON.parse(content.toString());

                this.project.deserialize(serialized);
                if (this.window) {

                    this.window.webContents.send("on-open", {});

                }

            })
            .catch((error) => {

                dialog.showMessageBox(null, {
                    type: "error",
                    message:
                    `Could not open project '${this.projectPath}':\n${error}`,
                    title: "Error opening project!"
                });

            });

    }

    openFrom (): void {

        dialog.showOpenDialog(null, {
            title: "Open Project",
            properties: ["openFile"],
            filters: [
                {
                    name: "Gepetto Project File",
                    extensions: ["gpp"]
                },
                {
                    name: "All File Types",
                    extensions: ["*"]
                }
            ]
        })
            .then(({canceled, filePaths}) => {

                if (canceled) {

                    return [null, null];

                }

                const [filePath] = filePaths;

                this.projectPath = filePath;
                app.addRecentDocument(filePath);
                this.open();

                return Promise.all([
                    fs.readFile(USER_CONFIG_PATH, {flag: "a+"}),
                    Promise.resolve(filePath)
                ]);

            })
            .then(([data, filePath]) => {

                let configData: {[key: string]: unknown} = {};

                try {

                    configData = JSON.parse(data.toString());

                } catch (_error) {

                    configData = {};

                }
                if (!("recentDocuments" in configData)) {

                    configData.recentDocuments = [];

                }

                if ((<string[]>configData.recentDocuments)
                    .every((existingFilePath) => existingFilePath
                      !== filePath)) {

                    (<string[]>configData.recentDocuments).push(filePath);

                    return fs.writeFile(
                        USER_CONFIG_PATH,
                        JSON.stringify(configData)
                    );

                }

                return Promise.resolve(null);

            })
            .catch((error) => {

                console.error(`error in project manager:\n${error}`);

            });

    }

    openObjectEditor (): void {

        this.drawObjectTree = new ProjectResourceManager(
            "DrawObjects.gpa",
            this.drawObjectTreeUnder,
            this
        );
        this.drawObjectTree.open();

    }

    closeObjectEditor (): void {

        if (this.drawObjectTree) {

            this.drawObjectTree.close();

        }

        this.drawObjectTree = null;
        console.log("closed!");

    }

}
