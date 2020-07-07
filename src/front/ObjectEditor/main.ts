import { SubDoc } from "../global/subdoc_alt.js";
import { TabContentImplementation } from "../global/tabs_alt.js";
import { DrawObjectTreeEditorWrapper, DrawObject, TransformCommand } from "../core/core.js";
import { SyncOrganizerType } from "../core/sync_alt/SyncOrganizer.js";
import { SyncConnector_Front } from "../global/SyncConnector_Front.js";
import { OnScriptLoad as loadDropdown } from "../global/dropdown.js";
import { arrayExpression } from "@babel/types";

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

export class ObjectEditor implements TabContentImplementation
{
    drawObjectTree: DrawObjectTreeEditorWrapper;

    onInit(root: SubDoc, _name: string)
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

            const validateResult = this.drawObjectTree.validateName(nameInput.value);
            if (!validateResult.success)
            {
                dialog.showMessageBox(currentWindow, {
                    type: "warning",
                    message: (<any>validateResult).message
                });
                return;
            }

            this.drawObjectTree.renameObject(this.drawObjectTree.under.under.selectedObject, nameInput.value);
        });

        this.drawObjectTree.under.addAllActionCallback((action, under) =>
        {
            if (!UPDATE_TEXT_TREE_BY_ACTIONS.has(action))
            {
                return;
            }

            root.getElementBySid("body").classList.add("hide-property");

            const textTreeList: HTMLOListElement = <HTMLOListElement>root.getElementBySid("text-tree--list");
            if (!textTreeList)
            {
                return;
            }
            textTreeList.innerHTML = "";

            under.rootObjects.forEach((object) =>
            {
                let newChild = document.createElement("li");
                newChild.innerText = object.name;
                if (this.drawObjectTree.under.under.selectedObject === object.name)
                {
                    newChild.classList.add("selected-element");
                    root.getElementBySid("body").classList.remove("hide-property");
                }

                newChild.addEventListener("click", () =>
                {
                    this.drawObjectTree.selectObject(object.name);
                });
                textTreeList.appendChild(newChild);
            });
        });

        this.drawObjectTree.under.addAllActionCallback((action, under) =>
        {
            if (!UPDATE_TRANSFORM_COMMANDS_BY_ACTIONS.has(action) || !this.drawObjectTree.under.under.selectedObject)
            {
                return;
            }

            const readOnlyTree = this.drawObjectTree.under.under;
            readOnlyTree.objects[ readOnlyTree.selectedObject ].transformCommands.forEach(command =>
            {
                console.log(command.type);
            });
        });

        this.drawObjectTree.under.addActionCallback("selectObject", (under, argumentList) =>
        {
            onChangeName(root, under.selectedObject);
        });
    }
    onDestroy(root: SubDoc, name: string)
    {

    }
    onSave(root: SubDoc, name: string)
    {

    }


}