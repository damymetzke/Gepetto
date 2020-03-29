import * as DropDown from "./dropdown.js";

const { ipcRenderer } = require("electron");

const { DrawObjectTree } = require("electron").remote.require("./core/draw-object-tree");
const { DrawObject } = require("electron").remote.require("./core/draw-object");
const { TransformCommand } = require("electron").remote.require("./core/transform-command");

let currentTransformCommands = [];

function TransformCommandTemplate(name, x, y)
{
    return `
<h5>${name}</h5>
<p>x</p>
<input class="transform-command-number-input" data-transform-command-key="x" type="number" value="${x}">
<p>y</p>
<input class="transform-command-number-input" data-transform-command-key="y" type="number" value="${y}">
`;
}

let treeRoot = null;
let propertyNameNode = null;
let propertyNameInputElement = null;
let propertyTransformCommandListElement = null;

function OnChangeTransformCommand(index, values)
{
    console.log(index, values, currentTransformCommands[index]);
    Object.assign(currentTransformCommands[index], values);
    ipcRenderer.invoke("update-object", {
        transformCommands: currentTransformCommands
    });
}

function OnChangeName()
{
    ipcRenderer.invoke("update-object", {
        name: propertyNameInputElement.value
    });
}

function OnSelectObject(objectName)
{
    ipcRenderer.invoke("select-object", objectName);
}

function OnRefreshSelectedContent(event, object)
{
    let elements = treeRoot.querySelectorAll("[data-draw-object-name]");
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

    propertyNameNode.innerText = object.name;
    propertyNameInputElement.value = object.name;

    propertyTransformCommandListElement.innerHTML = "";
    for (let i = 0; i < object.transformCommands.length; ++i)
    {
        let newElement = document.createElement("li");
        console.log(object.transformCommands[i]);
        newElement.innerHTML = TransformCommandTemplate(object.transformCommands[i].type, object.transformCommands[i].x, object.transformCommands[i].y);
        propertyTransformCommandListElement.appendChild(newElement);

        let inputFields = newElement.getElementsByClassName("transform-command-number-input");
        for (let j = 0; j < inputFields.length; ++j)
        {
            const index = i;
            const key = inputFields[j].dataset.transformCommandKey;
            inputFields[j].addEventListener("keypress", function (keyEvent)
            {
                if (keyEvent.key !== "Enter")
                {
                    return;
                }
                let newObject = {};
                newObject[key] = inputFields[j].value;
                OnChangeTransformCommand(index, newObject);
            });
        }
    }

    currentTransformCommands = object.transformCommands;
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

function OnAddTransformCommand(command)
{
    ipcRenderer.invoke("add-transform-command", command);
}

export function Run(root)
{
    DropDown.OnScriptLoad(root);

    propertyNameNode = root.getElementsByClassName("object-editor--property--name")[0];
    propertyNameInputElement = root.getElementsByClassName("object-editor--property--name-input")[0];
    propertyTransformCommandListElement = root.getElementsByClassName("object-editor--property--transform-list")[0];

    propertyNameInputElement.addEventListener("keypress", function (keyEvent)
    {
        if (keyEvent.key !== "Enter")
        {
            return;
        }
        OnChangeName();
    });

    const textTree = root.getElementsByClassName("object-editor--text-tree")[0];
    treeRoot = document.createElement("ol");
    textTree.appendChild(treeRoot);

    const transformCommandButtons = root.getElementsByClassName("object-editor--property--transform-add-controls")[0].children;
    for (let i = 0; i < transformCommandButtons.length; ++i)
    {
        const type = transformCommandButtons[i].dataset.transformCommandType;
        transformCommandButtons[i].addEventListener("click", function ()
        {
            OnAddTransformCommand(new TransformCommand(type, 0, 0));
        });
    }

    ipcRenderer.on("refresh-text-tree", OnRefreshTree);
    ipcRenderer.on("refresh-selected-object", OnRefreshSelectedContent);
}