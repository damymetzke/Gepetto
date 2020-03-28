import * as DropDown from "./dropdown.js";

const { ipcRenderer } = require("electron");

const { DrawObjectTree } = require("electron").remote.require("./core/draw-object-tree");
const { DrawObject } = require("electron").remote.require("./core/draw-object");

let treeRoot = null;

function OnSelectObject(objectName)
{
    ipcRenderer.invoke("select-object", objectName);
}

function OnRefreshSelectedContent(event, object)
{
    let elements = treeRoot.querySelectorAll("[data-draw-object-name]");
    console.log(elements);
    for (let i = 0; i < elements.length; ++i)
    {
        if (elements[i].dataset.drawObjectName === object.name)
        {
            elements[i].classList.add("selected-element");
        }
        else
        {
            elements[i].classList.remove("selected-element");
        }
    }
}

function OnRefreshTree(event, treeData)
{
    treeRoot.innerHTML = "";
    for (let i = 0; i < treeData.rootObjects.length; ++i)
    {
        const name = treeData.rootObjects[i].name;
        let newElement = document.createElement("li");
        newElement.innerText = name;
        newElement.dataset.drawObjectName = name;
        newElement.addEventListener("click", function ()
        {
            OnSelectObject(name);
        });
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
    ipcRenderer.on("refresh-selected-object", OnRefreshSelectedContent);
}