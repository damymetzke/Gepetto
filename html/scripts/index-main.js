import * as Dropdown from "./dropdown.js";
import * as Tabs from "./tabs.js";
import * as ContentLoader from "./content-loader.js";

import * as ObjectEditorMain from "./object-editor-main.js";

function ImportSvg()
{
    const BrowserWindow = require("electron").remote.BrowserWindow;
    let win = new BrowserWindow({
        width: 300,
        height: 300,
        webPreferences: {
            nodeIntegration: true
        },
        useContentSize: true,
        resizable: false,
        minimizable: false
    });

    win.loadFile("./svg-import.html");
}

export function Run(root)
{
    Dropdown.OnScriptLoad(root);
    Tabs.OnScriptLoad(root);

    const target = document.getElementById("main").children[0];
    ContentLoader.LoadContent(new ContentLoader.Content(ObjectEditorMain.Run, "./object-editor.html"), target);

    document.getElementById("toolbar--buttons--import-object").addEventListener("click", ImportSvg);
}