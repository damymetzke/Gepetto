import * as Dropdown from "../global/dropdown.js";
// import * as Tabs from "../global/tabs.js";
// import { SubDoc } from "../global/subdoc_alt.js";
import { TabCollection } from "../global/tabs_alt.js";
import { ObjectEditor } from "../ObjectEditor/main.js";
import { StartMenu } from "../Start/StartMain.js";

const currentWindow = require('electron').remote.getCurrentWindow();
const BrowserWindow = require("electron").remote.BrowserWindow;
const { Menu, MenuItem } = require("electron").remote;
const { ipcRenderer } = require("electron");

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

    const svgImportSubMenu_Developer = new MenuItem({
        type: "submenu",
        label: "Developer",
        submenu: [
            new MenuItem({
                label: "Toggle Developer Tools",
                click: () =>
                {
                    win.webContents.openDevTools();
                },
                accelerator: "CommandOrControl+Shift+I"
            })
        ]
    });

    const svgImportMenu = new Menu();
    svgImportMenu.append(svgImportSubMenu_Developer);

    win.setMenu(svgImportMenu);

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


    document.getElementById("toolbar--buttons--import-object").addEventListener("click", ImportSvg);
    document.getElementById("toolbar--buttons--edit-objects").addEventListener("click", openObjectEditor);

    ipcRenderer.once("open-start-tab", (_event, shouldOpen) =>
    {
        if (shouldOpen)
        {
            TAB_COLLECTION.createTab("Welcome", "./start.subdoc.html", new StartMenu(() =>
            {
                if ("Welcome" in TAB_COLLECTION.tabs)
                {
                    TAB_COLLECTION.tabs[ "Welcome" ].destroy();
                }

                openObjectEditor();
            }));
        }
        else
        {
            openObjectEditor();
        }

    });

    ipcRenderer.on("on-open", () =>
    {
        if ("Welcome" in TAB_COLLECTION.tabs)
        {
            TAB_COLLECTION.tabs[ "Welcome" ].destroy();
        }

        openObjectEditor();
    });

}

Run();