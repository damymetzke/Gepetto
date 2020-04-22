import common from "./object-editor-common.js";

import { GenerateTransformCommandElement } from "../global/element-generators.js";

const { ipcRenderer } = require("electron");

const { DrawObject } = require("electron").remote.require("../core/core");

/**
 * called whenever an object has been selected.
 * 
 * the name is passed to the main process which will select the correct object.
 * 
 * @param {String} objectName unique name of the object
 */
function OnSelectObject(objectName)
{
    ipcRenderer.invoke("select-object", objectName);
}

function OnSelectTransformCommand(index)
{
    ipcRenderer.invoke("select-transform-command", {
        index: index
    });
}

/**
 * called whenever a transform command changes.
 * 
 * will update the local copy based on the index and pass everything to the main process.
 * 
 * @param {Number} index integer value which is the offset in the array of transforms.
 * @param {Object} values object containing all properties that should be updated in the given TransformCommand.
 */
function OnChangeTransformCommand(index, values)
{
    let transformCommandUpdates = {};
    transformCommandUpdates[index] = values;
    ipcRenderer.invoke("update-object", {
        transformCommandUpdates: transformCommandUpdates
    });
}

function RefreshObjectTree(tree)
{
    common.elements.textTreeList.innerHTML = "";
    for (let i = 0; i < tree.rootObjects.length; ++i)
    {
        const name = tree.rootObjects[i].name;
        let newElement = document.createElement("li");
        newElement.innerText = name;
        newElement.dataset.drawObjectName = name;
        newElement.addEventListener("click", function ()
        {
            OnSelectObject(name);
        });
        common.elements.textTreeList.appendChild(newElement);
    }
}

function RefreshSelectedObject(object)
{
    //mark the selected object in the tree root
    let treeElements = common.elements.textTreeList.querySelectorAll("[data-draw-object-name]");
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

    common.elements.propertyName.innerText = object.name;
    common.elements.propertyNameInput.value = object.name;
    common.elements.propertyTransformCommandList.innerHTML = "";
    common.activeDrawObject = object;

    //fill transform command list
    for (let i = 0; i < object.transformCommands.length; ++i)
    {
        const index = i;
        // let newElement = document.createElement("li");
        // newElement.innerHTML = TransformCommandTemplate(object.transformCommands[i].type, object.transformCommands[i].x, object.transformCommands[i].y);
        // common.elements.propertyTransformCommandList.appendChild(newElement);

        let newElement = GenerateTransformCommandElement(object.transformCommands[i]);
        common.elements.propertyTransformCommandList.appendChild(newElement);

        newElement.addEventListener("click", function ()
        {
            OnSelectTransformCommand(index);
        });

        let inputFields = newElement.getElementsByClassName("transform-command-number-input");
        for (let j = 0; j < inputFields.length; ++j)
        {
            const index = i;
            const key = inputFields[j].dataset.transformCommandKey;
            const target = inputFields[j];
            inputFields[j].addEventListener("keypress", function (keyEvent)
            {
                if (keyEvent.key !== "Enter")
                {
                    return;
                }
                let newObject = {};
                newObject[key] = target.value;
                OnChangeTransformCommand(index, newObject);
            });
        }
    }
}

function RefreshTransformCommandIndex(index)
{
    common.transformCommandIndex = index;
    let children = common.elements.propertyTransformCommandList.children;
    for (let i = 0; i < children.length; ++i)
    {
        if (i == index)
        {
            children[i].classList.add("selected-transform-command");
        }
        else
        {
            children[i].classList.remove("selected-transform-command");
        }
    }
}

function OnRefreshObjects(_event, data)
{
    if ("objectTree" in data)
    {
        RefreshObjectTree(data.objectTree);
    }

    if ("selectedObject" in data)
    {
        let selectedObject = new DrawObject();
        selectedObject.FromPureObject(data.selectedObject);
        RefreshSelectedObject(selectedObject);
    }

    if ("transformCommandIndex" in data)
    {
        RefreshTransformCommandIndex(data.transformCommandIndex);
    }
}

function SetupIpcRenderer()
{
    ipcRenderer.on("refresh-objects", OnRefreshObjects);
}

export function Init()
{
    SetupIpcRenderer();
}