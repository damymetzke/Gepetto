const { app, BrowserWindow } = require("electron");
const { Init } = require("./draw-object-manager");

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

    window.loadFile('html/index.html');
    window.maximize();

    Init(window);
}

app.whenReady().then(createWindow);