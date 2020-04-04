//ES6 imports
import * as DropDown from "../global/dropdown.js";
import GetUniqueElements from "../global/get-unique-elements.js";

import * as ObjectEditorSvg from "./object-editor-svg.js";

//nodejs imports
const { ipcRenderer } = require("electron");

const { TransformCommand } = require("electron").remote.require("../core/core");

//utility functions//
/////////////////////

/**
 * generate the inside of a TransformCommand black to be displayed in the editor.
 * 
 * generated based on the following template:
 * ```html
 * <h5>{name}</h5>
 * 
 * <p>x</p>
 * <input class="transform-command-number-input" data-transform-command-key="x" type="number" value="{x}">
 * 
 * <p>y</p>
 * <input class="transform-command-number-input" data-transform-command-key="y" type="number" value="{y}">
 * ```
 * 
 * @param {String} name name of the transform command.
 * should be one of the following:
 * 
 * - TRANSLATE
 * - SCALE
 * - ROTATE
 * - SHEARX
 * - SHEARY
 * @param {Number} x
 * @param {Number} y 
 */
function TransformCommandTemplate(name, x, y)
{
    return `<h5>${name}</h5><p>x</p><input class="transform-command-number-input" data-transform-command-key="x" type="number" value="${x}"><p>y</p><input class="transform-command-number-input" data-transform-command-key="y" type="number" value="${y}">`;
}

//file variables//
//////////////////
let currentTransformCommands = [];
let treeRoot = null;
let elements = null;

/**
 * setup the file wide variables.
 * 
 * does the following:
 * 
 * - gets all unique elements.
 * - creates a root for the text-tree.
 * 
 * @see GetUniqueElements
 * 
 * @param {HTMLElement} root root element for the object editor
 */
function SetupFileVariables(root)
{
    elements = GetUniqueElements(root, {
        textTree: "object-editor--text-tree",
        propertyName: "object-editor--property--name",
        propertyNameInput: "object-editor--property--name-input",
        propertyTransformCommandList: "object-editor--property--transform-list",
        propertyTransformAddControls: "object-editor--property--transform-add-controls"
    });

    treeRoot = document.createElement("ol");
    elements.textTree.appendChild(treeRoot);
}

//ipcRenderer//
///////////////
/**
 * called whenever the DrawObjectTree is changed.
 * 
 * this function will recreate the text tree based on the tree data.
 * 
 * @alias module:ObjectEditor_Main#OnRefreshTree
 * 
 * @param {DrawObjectTree} data current DrawObjectTree from the main process.
 */
function OnRefreshTree(_event, data)
{
    const objectTree = data.objectTree;
    treeRoot.innerHTML = "";
    for (let i = 0; i < objectTree.rootObjects.length; ++i)
    {
        const name = objectTree.rootObjects[i].name;
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

/**
 * called whenever the selected object changes, or if any of its values change.
 * 
 * this function will do the following:
 * 
 * - highlight the current object in the text-tree.
 * - update the values in the property panel. 
 * 
 * @alias module:ObjectEditor_Main#OnRefreshSelectedContent
 * 
 * @param {DrawObject} object the currently selected object
 */
function OnRefreshSelectedContent(_event, data)
{
    if (!("object" in data))
    {
        return;
    }

    const object = data.object;
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
        const index = i;
        let newElement = document.createElement("li");
        newElement.innerHTML = TransformCommandTemplate(object.transformCommands[i].type, object.transformCommands[i].x, object.transformCommands[i].y);
        elements.propertyTransformCommandList.appendChild(newElement);

        newElement.addEventListener("click", function ()
        {
            OnSelectTransformCommand(index);
        });

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

function OnRefreshSelectedTransformCommand(_event, data)
{
    if (!("index" in data))
    {
        return;
    }

    let children = elements.propertyTransformCommandList.children;
    for (let i = 0; i < children.length; ++i)
    {
        if (i == data.index)
        {
            children[i].classList.add("selected-transform-command");
        }
        else
        {
            children[i].classList.remove("selected-transform-command");
        }
    }
}

/**
 * setup listners for inter-process communication
 * 
 * @see module:ObjectEditor_Main#OnRefreshTree
 * @see module:ObjectEditor_Main#OnRefreshSelectedContent
 */
function SetupIpcRenderer()
{
    ipcRenderer.on("refresh-text-tree", OnRefreshTree);
    ipcRenderer.on("refresh-selected-object", OnRefreshSelectedContent);
    ipcRenderer.on("refresh-selected-transform-command", OnRefreshSelectedTransformCommand);
}

//event listners//
//////////////////

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
    Object.assign(currentTransformCommands[index], values);
    ipcRenderer.invoke("update-object", {
        transformCommands: currentTransformCommands
    });
}

/**
 * called whenever the name of the selected object should be changed.
 * 
 * this is directly passed to the main process.
 */
function OnChangeName()
{
    ipcRenderer.invoke("update-object", {
        name: elements.propertyNameInput.value
    });
}

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
 * called whenever a new TransformCommand object should be created.
 * 
 * the object is directly passed to the main process where it will be added to the active DrawObject.
 * 
 * @param {TransformCommand} command the commands that should be added
 */
function OnAddTransformCommand(command)
{
    ipcRenderer.invoke("add-transform-command", command);
}

/**
 * setup listners based on user action
 * 
 * setup listners for:
 * 
 * - buttons to add TransformCommand objects.
 * - enter on the name input field.
 * 
 * @param {HTMLElement} root root element for the object editor
 */
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

/**
 * run the initialization code for the object editor.
 * 
 * whenever an object editor tab is created this should be called.
 * 
 * @param {HTMLElement} root root element for the object editor
 */
export function Run(root)
{
    DropDown.OnScriptLoad(root);

    ObjectEditorSvg.Init(root);

    SetupFileVariables(root);
    SetupIpcRenderer();
    SetupEventListeners(root);

}

/**
 * this module is in charge of the object editor
 *
 * @module ObjectEditor_Main
 */