const { app, BrowserWindow } = require("electron");
const { Init } = require("./draw-object-manager");
const { DrawObjectManager } = require("./DrawObject/DrawObjectManager");

const indexFilePath = `file://${__dirname}/../../index.html`;

const { SynchronizedTree, SynchronizedObject, SynchronizedTransformCommand, SynchronizedTreeLog: SynchronizedTreeLog, TransformCommandType } = require("./core/core");

let window = null;
let DrawObjectTreeManager = null;

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
}

app.whenReady().then(createWindow);

