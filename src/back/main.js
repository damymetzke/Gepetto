const { app, BrowserWindow } = require("electron");
const { Init } = require("./draw-object-manager");

const indexFilePath = `file://${__dirname}/../../index.html`;

let window = null;

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

    Init(window);
}

app.whenReady().then(createWindow);