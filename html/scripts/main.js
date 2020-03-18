const { app, BrowserWindow } = require("electron");

function createWindow()
{
    // Create the browser window.
    let win = new BrowserWindow({
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
    win.loadFile('index.html');
    //win.loadFile('object-editor.html');
    win.maximize();
}

app.whenReady().then(createWindow);