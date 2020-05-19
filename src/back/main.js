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
let tmp = new SynchronizedObject(tmpTree, "hello world");
let tmp2 = new SynchronizedObject(tmpTree, "this is the parent");
let comm = new SynchronizedTransformCommand(tmpTree, "hello world", 3);

tmp.ChangeName("some other name");
tmp.AddTransformCommand(TransformCommandType.TRANSLATE);
setTimeout(() =>
{
    tmp.ChangeName("the last name");
    tmp.Reparent(tmp2);
    tmp.Select();

    comm.SelectCommand();
    comm.Remove();
    console.log(tmpTree.GetString());
    tmpTree.WriteToFile("./saved/test.json");
}, 5000);

