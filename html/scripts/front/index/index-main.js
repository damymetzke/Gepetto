import * as Dropdown from "../global/dropdown.js";
import * as Tabs from "../global/tabs.js";
import * as ContentLoader from "../global/content-loader.js";

import * as ObjectEditorMain from "../object-editor/object-editor-main.js";

const currentWindow = require('electron').remote.getCurrentWindow();
const BrowserWindow = require("electron").remote.BrowserWindow;

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

    win.loadFile("./svg-import.html");
    win.once("ready-to-show", () =>
    {
        win.show();
    });
}

function Run()
{
    const root = document.getElementById("body");

    Dropdown.OnScriptLoad(root);
    Tabs.OnScriptLoad(root);

    const target = document.getElementById("main").children[0];
    ContentLoader.LoadContent(new ContentLoader.Content(ObjectEditorMain.Run, "./object-editor.html"), target);

    document.getElementById("toolbar--buttons--import-object").addEventListener("click", ImportSvg);
}

Run();