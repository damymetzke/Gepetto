const { app, BrowserWindow } = require("electron");
const { Init } = require("./draw-object-manager");

const indexFilePath = `file://${__dirname}/../../index.html`;

const { SynchronizedTree, SynchronizedObject, SynchronizedTransformCommand, SynchronizedTreeLog: SynchronizedTreeLog, TransformCommandType } = require("../core/core");

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

let tmpTree = new SynchronizedTreeLog();
let tmp = tmpTree.AddObject("hello world");

tmp.ChangeName("some other name");
tmp.ChangeName("the last name");

tmpTree.WriteToFile("./saved/test.json");
console.log(tmpTree);

