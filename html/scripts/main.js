const { app, BrowserWindow } = require("electron");
const { Init } = require("./draw-object-manager");

let window = null;

function createWindow()
{
    // Create the browser window.
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

    // and load the index.html of the app.
    window.loadFile('index.html');
    //win.loadFile('object-editor.html');
    window.maximize();

    Init(window);
}

app.whenReady().then(createWindow);