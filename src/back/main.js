const { app, BrowserWindow, ipcMain, Menu, MenuItem } = require("electron");
const { Init } = require("./draw-object-manager");
const { DrawObjectManager } = require("./DrawObject/DrawObjectManager");
const { ProjectManager } = require("./ProjectManager");

const indexFilePath = `file://${__dirname}/../../index.html`;

const { SynchronizedTree, SynchronizedObject, SynchronizedTransformCommand, SynchronizedTreeLog: SynchronizedTreeLog, TransformCommandType } = require("./core/core");

let window = null;
let DrawObjectTreeManager = null;
let projectManager = null;

function createWindow()
{
    window = new BrowserWindow({
        width: 1000,
        height: 800,
        minWidth: 700,
        minHeight: 500,
        webPreferences: {
            nodeIntegration: true
        },
        useContentSize: true
    });

    window.loadURL(indexFilePath);
    window.maximize();

    // Init(window);
    DrawObjectTreeManager = new DrawObjectManager(window);
    projectManager = new ProjectManager("./saved/project.gpp", DrawObjectTreeManager.drawObjectTree.under.under);

    const applicationSubMenu_File = new MenuItem({
        type: "submenu",
        label: "File",
        submenu: [
            new MenuItem({
                label: "Open Project",
                click: () =>
                {
                    projectManager.openFrom();
                }
            }),
            new MenuItem({
                label: "Save Project",
                click: () =>
                {
                    projectManager.save();
                }
            }),
            new MenuItem({
                label: "Save As",
                click: () =>
                {
                    projectManager.saveAs();
                }
            })
        ]
    });

    const applicationSubMenu_Developer = new MenuItem({
        type: "submenu",
        label: "Developer",
        submenu: [
            new MenuItem({
                label: "Toggle Developer Tools",
                click: () =>
                {
                    window.webContents.openDevTools();
                },
                accelerator: "CommandOrControl+Shift+I"
            })
        ]
    });

    const applicationMenu = new Menu();
    applicationMenu.append(applicationSubMenu_File);
    applicationMenu.append(applicationSubMenu_Developer);


    Menu.setApplicationMenu(applicationMenu);

    ipcMain.on("saveProject", () =>
    {
        projectManager.save();
    });

    projectManager.open();
}

app.whenReady().then(createWindow);

