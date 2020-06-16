import * as Dropdown from "../global/dropdown.js";
// import * as Tabs from "../global/tabs.js";
// import { SubDoc } from "../global/subdoc_alt.js";
import { TabCollection } from "../global/tabs_alt.js";

const currentWindow = require('electron').remote.getCurrentWindow();
const BrowserWindow = require("electron").remote.BrowserWindow;

const svgImportFilePath = `file://${__dirname}/svg-import.html`;

const TAB_COLLECTION = new TabCollection(document.getElementById("tabs"), document.getElementById("main"));

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

function Run()
{
    const root = document.getElementById("body");

    Dropdown.OnScriptLoad(root);
    // Tabs.OnScriptLoad(root);

    TAB_COLLECTION.createTab("object editor", "./object-editor.subdoc.html");
    TAB_COLLECTION.createTab("object editor 2", "./object-editor.subdoc.html");

    document.getElementById("toolbar--buttons--import-object").addEventListener("click", ImportSvg);


    // const objectEditor = new SubDoc("./object-editor.subdoc.html", document.getElementById("main").children[ 1 ], () =>
    // {
    //     console.log(objectEditor.getElementBySid("header"));
    //     console.log(objectEditor.getElementBySid("text-tree"));
    //     console.log(objectEditor.getElementBySid("text-tree--list"));
    //     console.log(objectEditor.getElementBySid("property--transform-add-controls"));
    // });


}

Run();