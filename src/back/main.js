const { app, BrowserWindow, ipcMain } = require("electron");
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

    ipcMain.on("saveProject", () =>
    {
        projectManager.save();
    });
}

app.whenReady().then(createWindow);

