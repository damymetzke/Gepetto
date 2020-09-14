const {app, BrowserWindow, ipcMain, Menu, MenuItem} = require("electron");
const {DrawObjectManager} = require("./DrawObject/DrawObjectManager");
const {ProjectManager} = require("./ProjectManager");

const path = require("path");
const fs = require("fs").promises;

const indexFilePath = `file://${__dirname}/../../index.html`;

const USER_CONFIG_PATH = path.join(app.getPath("userData"), "config.json");

let window = null;
let DrawObjectTreeManager = null;
let projectManager = null;
let configData = {};

function createWindow () {

    window = new BrowserWindow({
        width: 1000,
        height: 800,
        minWidth: 700,
        minHeight: 500,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        },
        useContentSize: true
    });

    const projectPath = (process.argv.length >= 3)
        ? process.argv[2]
        : "";

    window.loadURL(indexFilePath)
        .then(() => {

            window.webContents.send("open-start-tab", !projectPath);

        });
    window.maximize();


    // init(window);
    DrawObjectTreeManager = new DrawObjectManager(window);
    projectManager = new ProjectManager(
        projectPath,
        DrawObjectTreeManager.drawObjectTree,
        window
    );


    // todo: filter out deleted projects
    const recentDocuments = ("recentDocuments" in configData)
        ? configData.recentDocuments
            .filter((recentDocument) => typeof recentDocument === "string")
            .map((recentDocument) => new MenuItem({
                label: path.basename(recentDocument),
                click: () => {

                    projectManager.open(recentDocument);

                }
            }))
        : [];

    const applicationSubMenu_File = new MenuItem({
        type: "submenu",
        label: "File",
        submenu: [
            new MenuItem({
                label: "Open Project",
                click: () => {

                    projectManager.openFrom();

                },
                accelerator: "CommandOrControl+O"
            }),
            new MenuItem({
                label: "Open Recent",
                submenu: [
                    ...recentDocuments,
                    new MenuItem({
                        label: "Clear Recent",
                        click: () => {

                            fs.readFile(USER_CONFIG_PATH)
                                .then((data) => {

                                    let userConfigData = {};

                                    try {

                                        // eslint-disable-next-line max-len
                                        userConfigData = JSON.parse(data.toString());

                                    } catch (_error) {

                                        userConfigData = {};

                                    }

                                    // eslint-disable-next-line max-len
                                    if ("recentDocuments" in userConfigData && userConfigData.recentDocuments.length > 0) {

                                        delete userConfigData.recentDocuments;

                                        // eslint-disable-next-line max-len
                                        fs.writeFile(USER_CONFIG_PATH, JSON.stringify(userConfigData));

                                    }

                                })
                                .catch((error) => {

                                    // eslint-disable-next-line max-len
                                    console.error(`error clearing recent documents:\n${error}`);

                                });

                        }
                    })
                ]
            }),
            new MenuItem({
                label: "Save Project",
                click: () => {

                    projectManager.save();

                },
                accelerator: "CommandOrControl+Alt+S"
            }),
            new MenuItem({
                label: "Save As",
                click: () => {

                    projectManager.saveAs();

                },
                accelerator: "CommandOrControl+Shift+S"
            })
        ]
    });

    const applicationSubMenu_Developer = new MenuItem({
        type: "submenu",
        label: "Developer",
        submenu: [
            new MenuItem({
                label: "Toggle Developer Tools",
                click: () => {

                    window.webContents.openDevTools();

                },
                accelerator: "CommandOrControl+Shift+I"
            })
        ]
    });

    const applicationMenu = new Menu();

    applicationMenu.append(applicationSubMenu_File);
    applicationMenu.append(applicationSubMenu_Developer);


    window.setMenu(applicationMenu);

    ipcMain.on("saveProject", () => {

        projectManager.save();

    });

    ipcMain.on("open-project-from", () => {

        projectManager.openFrom();

    });

    ipcMain.on("open-project", (_event, {path: openProjectPath}) => {

        if (!path) {

            return;

        }
        projectManager.open(openProjectPath);

    });

    projectManager.open();

}

fs.readFile(USER_CONFIG_PATH)
    .then((data) => {

        configData = JSON.parse(data.toString());
        ipcMain.handle(
            "request-recents",
            () => (("recentDocuments" in configData)
                ? configData.recentDocuments
                : [])
        );
        app.whenReady().then(createWindow);

    })
    .catch(() => {

        app.whenReady().then(createWindow);

    });
