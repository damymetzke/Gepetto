//ES6 imports
import * as DropDown from "../global/dropdown.js";
import GetUniqueElements from "../global/get-unique-elements.js";

//nodejs imports
const { ipcRenderer } = require("electron");

const { TransformCommand } = require("electron").remote.require("../core/core");

//utility functions//
/////////////////////
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

//file variables//
//////////////////
let currentTransformCommands = [];
let treeRoot = null;
let elements = null;

function SetupFileVariables(root)
{
    treeRoot = document.createElement("ol");
    elements = GetUniqueElements(root, {
        textTree: "object-editor--text-tree",
        propertyName: "object-editor--property--name",
        propertyNameInput: "object-editor--property--name-input",
        propertyTransformCommandList: "object-editor--property--transform-list",
        propertyTransformAddControls: "object-editor--property--transform-add-controls"
    });

    elements.textTree.appendChild(treeRoot);
}

//ipcRenderer//
///////////////
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

function OnRefreshSelectedContent(event, object)
{
    let treeElements = treeRoot.querySelectorAll("[data-draw-object-name]");
    for (let i = 0; i < treeElements.length; ++i)
    {
        if (treeElements[i].dataset.drawObjectName === object.name)
        {
            treeElements[i].classList.add("selected-element");
        }
        else
        {
            treeElements[i].classList.remove("selected-element");
        }
    }

    elements.propertyName.innerText = object.name;
    elements.propertyNameInput.value = object.name;

    elements.propertyTransformCommandList.innerHTML = "";
    for (let i = 0; i < object.transformCommands.length; ++i)
    {
        let newElement = document.createElement("li");
        console.log(object.transformCommands[i]);
        newElement.innerHTML = TransformCommandTemplate(object.transformCommands[i].type, object.transformCommands[i].x, object.transformCommands[i].y);
        elements.propertyTransformCommandList.appendChild(newElement);

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

function SetupIpcRenderer()
{
    ipcRenderer.on("refresh-text-tree", OnRefreshTree);
    ipcRenderer.on("refresh-selected-object", OnRefreshSelectedContent);
}

//event listners//
//////////////////

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
        name: elements.propertyNameInput.value
    });
}

function OnSelectObject(objectName)
{
    ipcRenderer.invoke("select-object", objectName);
}

function OnAddTransformCommand(command)
{
    ipcRenderer.invoke("add-transform-command", command);
}

function SetupEventListeners(root)
{
    elements.propertyNameInput.addEventListener("keypress", function (keyEvent)
    {
        if (keyEvent.key !== "Enter")
        {
            return;
        }
        OnChangeName();
    });

    const transformCommandButtons = elements.propertyTransformAddControls.children;
    for (let i = 0; i < transformCommandButtons.length; ++i)
    {
        const type = transformCommandButtons[i].dataset.transformCommandType;
        transformCommandButtons[i].addEventListener("click", function ()
        {
            OnAddTransformCommand(new TransformCommand(type, 0, 0));
        });
    }
}

export function Run(root)
{
    DropDown.OnScriptLoad(root);

    SetupFileVariables(root);
    SetupIpcRenderer();
    SetupEventListeners(root);

}