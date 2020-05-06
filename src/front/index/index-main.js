import * as Dropdown from "../global/dropdown.js";
import * as Tabs from "../global/tabs.js";
import * as ContentLoader from "../global/content-loader.js";
import { SubDocHandler } from "../global/subdoc.js";

import * as ObjectEditorMain from "../object-editor/object-editor-main.js";

const currentWindow = require('electron').remote.getCurrentWindow();
const BrowserWindow = require("electron").remote.BrowserWindow;

const svgImportFilePath = `file://${__dirname}/svg-import.html`;

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
    Tabs.OnScriptLoad(root);

    const target = document.getElementById("main").children[0];
    ContentLoader.LoadContent(new ContentLoader.Content(ObjectEditorMain.Run, "./object-editor.html"), target);

    document.getElementById("toolbar--buttons--import-object").addEventListener("click", ImportSvg);

    let client = new XMLHttpRequest();
    client.open('GET', "./object-editor-alt.html");
    client.onload = function ()
    {
        let raw = client.response;
        let subdoc = new SubDocHandler(raw);
        document.getElementById("main").children[1].appendChild(subdoc.root);

    };

    client.send();
}

Run();