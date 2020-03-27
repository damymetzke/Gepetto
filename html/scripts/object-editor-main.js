import * as DropDown from "./dropdown.js";

const { ipcRenderer } = require("electron");

const { DrawObjectTree } = require("electron").remote.require("./core/draw-object-tree");
const { DrawObject } = require("electron").remote.require("./core/draw-object");

let treeRoot = null;

function OnRefreshTree(event, treeData)
{
    treeRoot.innerHTML = "";
    console.log(treeData.rootObjects);
    for (let i = 0; i < treeData.rootObjects.length; ++i)
    {
        let newElement = document.createElement("li");
        newElement.innerText = treeData.rootObjects[i].name;
        treeRoot.appendChild(newElement);
    }
}

export function Run(root)
{
    DropDown.OnScriptLoad(root);

    const textTree = root.getElementsByClassName("object-editor--text-tree")[0];
    treeRoot = document.createElement("ol");
    textTree.appendChild(treeRoot);

    ipcRenderer.on("refresh-text-tree", OnRefreshTree);
}