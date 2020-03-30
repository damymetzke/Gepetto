//ES6 imports
import * as DropDown from "../global/dropdown.js";

//nodejs imports
const { ipcRenderer } = require("electron");

const { TransformCommand } = require("electron").remote.require("../core/transform-command");

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
let propertyElements = {
    name: null,
    nameInput: null,
    transformCommandList: null
};

function SetupFileVariables(root)
{
    treeRoot = document.createElement("ol");
    propertyElements = {
        name: root.getElementsByClassName("object-editor--property--name")[0],
        nameInput: root.getElementsByClassName("object-editor--property--name-input")[0],
        transformCommandList: root.getElementsByClassName("object-editor--property--transform-list")[0]
    };

    root.getElementsByClassName("object-editor--text-tree")[0].appendChild(treeRoot);
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

    propertyElements.name.innerText = object.name;
    propertyElements.nameInput.value = object.name;

    propertyElements.transformCommandList.innerHTML = "";
    for (let i = 0; i < object.transformCommands.length; ++i)
    {
        let newElement = document.createElement("li");
        console.log(object.transformCommands[i]);
        newElement.innerHTML = TransformCommandTemplate(object.transformCommands[i].type, object.transformCommands[i].x, object.transformCommands[i].y);
        propertyElements.transformCommandList.appendChild(newElement);

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
        name: propertyElements.nameInput.value
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
    propertyElements.nameInput.addEventListener("keypress", function (keyEvent)
    {
        if (keyEvent.key !== "Enter")
        {
            return;
        }
        OnChangeName();
    });

    const transformCommandButtons = root.getElementsByClassName("object-editor--property--transform-add-controls")[0].children;
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