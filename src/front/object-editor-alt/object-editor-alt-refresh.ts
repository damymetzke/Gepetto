import { SubDocHandler } from "../global/subdoc.js";
const { ipcRenderer } = require("electron");

const { DrawObjectTree } = require("electron").remote.require("../core/draw-object-tree.js");

interface IpcRefreshObjects
{
    objectTree: {};
    selectedObject: {} | null;
    transformCommandIndex: number;
}
type RefreshFunctionType = (root: SubDocHandler, data: any) => void;

function OnSelectObject(event: MouseEvent, name: string)
{

}

const refreshFunctions: { [key: string]: RefreshFunctionType; } = {
    objectTree: (root: SubDocHandler, data: {}) =>
    {
        let tree = new DrawObjectTree();
        tree.FromPureObject(data);

        const treeList = root.GetElementBySid("text-tree--list");
        treeList.innerHTML = "";
        tree.rootObjects.forEach((subObject: any /*todo: set type to drawobject*/) =>
        {
            const name: string = subObject.name;
            let newElement = document.createElement("li");
            newElement.innerText = name;
            newElement.dataset.drawObjectName = name;
            newElement.addEventListener("click", (event) => { OnSelectObject(event, name); });
            treeList.appendChild(newElement);
        });
    },
    selectedObject: (root: SubDocHandler, data: {}) =>
    {

    },
    transformCommandIndex: (root: SubDocHandler, data: number) =>
    {

    }
};

function OnRefreshObjects(root: SubDocHandler, event: Electron.IpcRendererEvent, data: IpcRefreshObjects)
{
    console.log(data);
    for (let key in refreshFunctions)
    {
        if (key in data)
        {
            refreshFunctions[key](root, data[key]);
        }
    }
}

export function Init(root: SubDocHandler)
{
    ipcRenderer.on("refresh-objects", (event, data) => { console.log("🎶"); OnRefreshObjects(root, event, data); });
}