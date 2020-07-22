import * as Dropdown from "../global/dropdown.js";
// import * as Tabs from "../global/tabs.js";
// import { SubDoc } from "../global/subdoc_alt.js";
import { TabCollection } from "../global/tabs_alt.js";
import { ObjectEditor } from "../ObjectEditor/main.js";

const currentWindow = require('electron').remote.getCurrentWindow();
const BrowserWindow = require("electron").remote.BrowserWindow;

const svgImportFilePath = `file://${__dirname}/svg-import.html`;

const TAB_COLLECTION = new TabCollection(document.getElementById("tabs"), document.getElementById("main"));

class EmptyImplementation
{
    onInit(root, name)
    {
        console.log("init", name);
    }
    onDestroy(root, name)
    {
        console.log("destroy", name);
    }
    onSave(root, name)
    {
        console.log("save", name);
    }
}

function ImportSvg()
{
    let win = new BrowserWindow({
        width: 300,
        height: 300,
        webPreferences: {
            nodeIntegration: true
        },
        useContentSize: true,
        resizable: false,
        minimizable: false,
        parent: currentWindow,
        modal: true,
        show: false
    });

    console.log(svgImportFilePath);
    win.loadURL(svgImportFilePath);
    win.once("ready-to-show", () =>
    {
        win.show();
    });
}

function openObjectEditor()
{

    for (const name in TAB_COLLECTION.tabs)
    {
        if (name === "Object Editor")
        {
            TAB_COLLECTION.selectTab(name);
            return;
        }
    }

    TAB_COLLECTION.createTab("Object Editor", "./object-editor.subdoc.html", new ObjectEditor());
}

function Run()
{
    const root = document.getElementById("body");

    Dropdown.OnScriptLoad(root);

    openObjectEditor();

    document.getElementById("toolbar--buttons--import-object").addEventListener("click", ImportSvg);
    document.getElementById("toolbar--buttons--edit-objects").addEventListener("click", openObjectEditor);
}

Run();