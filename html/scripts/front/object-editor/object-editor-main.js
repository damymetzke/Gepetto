//ES6 imports
import * as DropDown from "../global/dropdown.js";
import GetUniqueElements from "../global/get-unique-elements.js";

import * as ObjectEditorSvg from "./object-editor-svg.js";
import * as ObjectEditorRefresh from "./object-editor-refresh.js";
import common from "./object-editor-common.js";

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
    common.elements = GetUniqueElements(root, {
        textTree: "object-editor--text-tree",
        textTreeList: "object-editor--text-tree--list",
        propertyName: "object-editor--property--name",
        propertyNameInput: "object-editor--property--name-input",
        propertyTransformCommandList: "object-editor--property--transform-list",
        propertyTransformAddControls: "object-editor--property--transform-add-controls"
    });
}

//ipcRenderer//
///////////////

//todo: split up this chunky boi
function OnRefreshObjects(_event, data)
{
    if (false)
    {
        const objectTree = data.objectTree;
        common.elements.textTreeList.innerHTML = "";
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
            common.elements.textTreeList.appendChild(newElement);
        }
    }

    if ("selectedObject" in data)
    {
        const object = data.selectedObject;
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
        for (let i = 0; i < object.transformCommands.length; ++i)
        {
            const index = i;
            let newElement = document.createElement("li");
            newElement.innerHTML = TransformCommandTemplate(object.transformCommands[i].type, object.transformCommands[i].x, object.transformCommands[i].y);
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

        currentTransformCommands = object.transformCommands;
    }

    if ("transformCommandIndex" in data)
    {
        let children = common.elements.propertyTransformCommandList.children;
        for (let i = 0; i < children.length; ++i)
        {
            if (i == data.transformCommandIndex)
            {
                children[i].classList.add("selected-transform-command");
            }
            else
            {
                children[i].classList.remove("selected-transform-command");
            }
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
    ipcRenderer.on("refresh-objects", OnRefreshObjects);
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
    let transformCommandUpdates = {};
    transformCommandUpdates[index] = values;
    ipcRenderer.invoke("update-object", {
        transformCommandUpdates: transformCommandUpdates
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
    common.elements.propertyNameInput.addEventListener("keypress", function (keyEvent)
    {
        if (keyEvent.key !== "Enter")
        {
            return;
        }
        OnChangeName();
    });

    const transformCommandButtons = common.elements.propertyTransformAddControls.children;
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
    ObjectEditorRefresh.Init();

    SetupFileVariables(root);
    SetupIpcRenderer();
    SetupEventListeners(root);

}

/**
 * this module is in charge of the object editor
 *
 * @module ObjectEditor_Main
 */