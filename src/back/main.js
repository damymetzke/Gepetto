const { app, BrowserWindow } = require("electron");
const { Init } = require("./draw-object-manager");

const indexFilePath = `file://${__dirname}/../../index.html`;

const { SynchronizedTree, SynchronizedObject, SynchronizedTreeLog: SynchronizedTreeLog } = require("../core/core");

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
tmp.ChangeName({
    name: "bye world 😢"
});
setTimeout(() =>
{
    tmp.ChangeName({
        name: "what is happening",
        wrong: false
    });
    console.log(tmpTree.GetString());
    tmpTree.WriteToFile("./saved/test.json");
}, 5000);

