//ES6 imports
import * as DropDown from "../global/dropdown.js";
import GetUniqueElements from "../global/get-unique-elements.js";

import * as ObjectEditorSvg from "./object-editor-svg.js";
import * as ObjectEditorRefresh from "./object-editor-refresh.js";
import common from "./object-editor-common.js";

//nodejs imports
const { ipcRenderer } = require("electron");

const { TransformCommand } = require("electron").remote.require("../core/core");

/**
 * setup the common variables.
 * 
 * @see GetUniqueElements
 * 
 * @param {HTMLElement} root root element for the object editor
 */
function SetupCommonVariables(root)
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

//event listners//
//////////////////

/**
 * called whenever the name of the selected object should be changed.
 * 
 * this is directly passed to the main process.
 */
function OnChangeName()
{
    ipcRenderer.invoke("update-object", {
        name: common.elements.propertyNameInput.value
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

    SetupCommonVariables(root);
    SetupEventListeners(root);

}

/**
 * this module is in charge of the object editor
 *
 * @module ObjectEditor_Main
 */