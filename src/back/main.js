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

let tmpTreeUseless = new SynchronizedTreeLog();
let tmpTree = new SynchronizedTreeLog(tmpTreeUseless);
let tmp = tmpTree.AddObject("hello world");
let tmp2 = tmpTree.AddObject("bye world");
let focus = tmpTree.Focus();

tmp.Select();
focus.ChangeName("the first change");
focus.ChangeName("the first change again");

tmp2.Select();
focus.ChangeName("the second change");

tmpTree.WriteToFile("./saved/test.json");
tmpTreeUseless.WriteToFile("./saved/test_useless.json");
console.log(tmpTree);

