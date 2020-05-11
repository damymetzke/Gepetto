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
    ipcRenderer.invoke("select-object", name);
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
    selectedObject: (root: SubDocHandler, data: any) =>
    {
        if (data === null)
        {
            root.GetElementBySid("body").classList.add("hide-property");
            return;
        }
        root.GetElementBySid("body").classList.remove("hide-property");

        function RemoveSelectedExceptFor(element: Element, name: string)
        {
            Array.from(element.children).forEach((child: HTMLElement | SVGElement) =>
            {
                if (child.dataset.drawObjectName === name)
                {
                    child.classList.add("selected-element");
                }
                else
                {
                    child.classList.remove("selected-element");
                }

                RemoveSelectedExceptFor(child, name);
            });
        }
        RemoveSelectedExceptFor(root.GetElementBySid("text-tree--list"), data.name);

        (<HTMLHeadingElement>root.GetElementBySid("property--name")).innerText = data.name;
        (<HTMLInputElement>root.GetElementBySid("property--name-input")).value = data.name;
        (<HTMLOListElement>root.GetElementBySid("property--transform-list")).innerHTML = "";

        Array.from(data.transformCommands).forEach((command, index) =>
        {
            console.log("🚁", command);
        });

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