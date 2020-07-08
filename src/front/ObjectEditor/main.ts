import { SubDoc } from "../global/subdoc_alt.js";
import { TabContentImplementation } from "../global/tabs_alt.js";
import { DrawObjectTreeEditorWrapper, DrawObject, TransformCommand } from "../core/core.js";
import { SyncOrganizerType } from "../core/sync_alt/SyncOrganizer.js";
import { SyncConnector_Front } from "../global/SyncConnector_Front.js";
import { OnScriptLoad as loadDropdown } from "../global/dropdown.js";
import { updateTextTree, updateTransformCommands } from "./Updates.js";

const dialog = require("electron").remote.dialog;
const currentWindow = require("electron").remote.getCurrentWindow();

const UPDATE_TEXT_TREE_BY_ACTIONS = new Set([
    "AddObject",
    "AddObjectToRoot",
    "FromPureObject",
    "selectObject",
    "renameObject",
    "--fullSync"
]);

const UPDATE_TRANSFORM_COMMANDS_BY_ACTIONS = new Set([
    "selectObject",
    "addTransformCommand",
    "--fullSync"
]);

function onChangeName(root: SubDoc, name: string)
{
    (<HTMLElement>root.getElementBySid("property--name")).innerText = name;
    (<HTMLInputElement>root.getElementBySid("property--name-input")).value = name;
}

function onRename(event: KeyboardEvent, nameInput: HTMLInputElement, tree: DrawObjectTreeEditorWrapper)
{
    const validateResult = tree.validateName(nameInput.value);
    if (!validateResult.success)
    {
        dialog.showMessageBox(currentWindow, {
            type: "warning",
            message: (<any>validateResult).message
        });
        return;
    }

    tree.renameObject(tree.under.under.selectedObject, nameInput.value);
});

export class ObjectEditor implements TabContentImplementation
{
    drawObjectTree: DrawObjectTreeEditorWrapper;
    resourceDirectory: string;

    constructor ()
    {
        this.resourceDirectory = "../saved/objects";
    }

    onInit(root: SubDoc)
    {
        loadDropdown(root.root);

        Array.from(root.getElementBySid("property--transform-add-controls").children).forEach((child: HTMLButtonElement) =>
        {
            child.addEventListener("click", () =>
            {
                this.drawObjectTree.addTransformCommand(this.drawObjectTree.under.under.selectedObject, new TransformCommand(child.dataset.transformCommandType));
            });
        });

        this.drawObjectTree = new DrawObjectTreeEditorWrapper(SyncOrganizerType.SUBSCRIBER, new SyncConnector_Front("draw-object-tree"));
        this.drawObjectTree.under.organizer.requestSync();

        const nameInput = <HTMLInputElement>root.getElementBySid("property--name-input");

        nameInput.addEventListener("keydown", (event: KeyboardEvent) =>
        {
            if (event.key !== "Enter")
            {
                return;
            }

            onRename(event, nameInput, this.drawObjectTree);
        });

        this.drawObjectTree.under.addAllActionCallback((action, under) =>
        {
            if (!UPDATE_TEXT_TREE_BY_ACTIONS.has(action))
            {
                return;
            }

            updateTextTree(root, this.drawObjectTree, under);
        });

        this.drawObjectTree.under.addAllActionCallback((action, under) =>
        {
            if (!UPDATE_TRANSFORM_COMMANDS_BY_ACTIONS.has(action) || !this.drawObjectTree.under.under.selectedObject)
            {
                return;
            }

            updateTransformCommands(root, this.drawObjectTree, under);
        });

        this.drawObjectTree.under.addActionCallback("selectObject", (under, argumentList) =>
        {
            onChangeName(root, under.selectedObject);
        });

        this.drawObjectTree.under.addActionCallback("AddObjectToRoot", (_under, argumentList) =>
        {
            // console.log((<DrawObject>argumentList[ 0 ]).name);
            let objectRequest = new window.XMLHttpRequest();
            objectRequest.open("GET", `${this.resourceDirectory}/${(<DrawObject>argumentList[ 0 ]).name}.xml`);
            objectRequest.onload = () =>
            {
                console.log(objectRequest.response);
            };
            objectRequest.send();
        });
    }
    onDestroy(root: SubDoc, name: string)
    {

    }
    onSave(root: SubDoc, name: string)
    {

    }


}