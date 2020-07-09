import { SubDoc } from "../global/subdoc_alt.js";
import { TabContentImplementation } from "../global/tabs_alt.js";
import { DrawObjectTreeEditorWrapper, DrawObject, TransformCommand } from "../core/core.js";
import { SyncOrganizerType } from "../core/sync_alt/SyncOrganizer.js";
import { SyncConnector_Front } from "../global/SyncConnector_Front.js";
import { OnScriptLoad as loadDropdown } from "../global/dropdown.js";
import { updateTextTree, updateTransformCommands } from "./Updates.js";

const dialog = require("electron").remote.dialog;
const currentWindow = require("electron").remote.getCurrentWindow();

const REGEX_XML_CONTENT = /^<root>([^]*)<\/root>$/i;

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
};

function loadXmlObject(newObject: DrawObject, root: SubDoc, resourceDirectory: string): Promise<SVGGElement>
{
    const resourceLoaction = `${resourceDirectory}/${newObject.name}.xml`;
    let objectRequest = new window.XMLHttpRequest();
    objectRequest.open("GET", resourceLoaction);

    return new Promise((resolve, reject) =>
    {
        objectRequest.onload = () =>
        {
            const match = REGEX_XML_CONTENT.exec(objectRequest.response);
            if (!match)
            {
                const errorMessage = `could not load object '${newObject.name}' svg data at resource location '${resourceLoaction}'`;
                console.error(errorMessage);
                reject(errorMessage);
            }

            const [ , svgContent ] = match;

            let newGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
            newGroup.innerHTML = svgContent;

            newGroup.setAttribute("transform", newObject.WorldTransform().svgString());

            root.getElementBySid("main--svg").appendChild(newGroup);
            resolve(newGroup);
        };
        objectRequest.send();
    });


}

export class ObjectEditor implements TabContentImplementation
{
    drawObjectTree: DrawObjectTreeEditorWrapper;
    resourceDirectory: string;
    displayedObjects: { [ name: string ]: SVGGElement; };
    connector: SyncConnector_Front;

    constructor ()
    {
        this.resourceDirectory = "../saved/objects";
        this.displayedObjects = {};
    }

    onInit(root: SubDoc)
    {
        this.connector = new SyncConnector_Front("draw-object-tree");
        this.drawObjectTree = new DrawObjectTreeEditorWrapper(SyncOrganizerType.SUBSCRIBER, this.connector);
        this.drawObjectTree.under.organizer.requestSync();

        loadDropdown(root.root);

        Array.from(root.getElementBySid("property--transform-add-controls").children).forEach((child: HTMLButtonElement) =>
        {
            child.addEventListener("click", () =>
            {
                this.drawObjectTree.addTransformCommand(this.drawObjectTree.under.under.selectedObject, new TransformCommand(child.dataset.transformCommandType));
            });
        });


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

            if (root.ready)
            {
                updateTextTree(root, this.drawObjectTree, under);
                return;
            }

            root.onReady.push(() =>
            {
                updateTextTree(root, this.drawObjectTree, under);
            });

        });

        this.drawObjectTree.under.addAllActionCallback((action, under) =>
        {
            if (!UPDATE_TRANSFORM_COMMANDS_BY_ACTIONS.has(action) || !this.drawObjectTree.under.under.selectedObject)
            {
                return;
            }

            if (root.ready)
            {
                updateTransformCommands(root, this.drawObjectTree, under);
                return;
            }

            root.onReady.push(() =>
            {
                updateTransformCommands(root, this.drawObjectTree, under);
            });

        });

        this.drawObjectTree.under.addActionCallback("selectObject", (under, argumentList) =>
        {
            onChangeName(root, under.selectedObject);
        });

        this.drawObjectTree.under.addActionCallback("AddObjectToRoot", (_under, argumentList: [ DrawObject ]) =>
        {
            loadXmlObject(argumentList[ 0 ], root, this.resourceDirectory).then((result) =>
            {
                this.displayedObjects[ argumentList[ 0 ].name ] = result;
            });
        });

        this.drawObjectTree.under.addActionCallback("renameObject", (_under, argumentList: [ string, string ]) =>
        {
            const [ oldName, newName ] = argumentList;
            if (!(oldName in this.displayedObjects))
            {
                console.warn(`object '${oldName}' is not tracked for display`);
                return;
            }

            this.displayedObjects[ newName ] = this.displayedObjects[ oldName ];
            delete this.displayedObjects[ oldName ];
        });

        console.log("ψ(._. )>");
        this.drawObjectTree.under.addActionCallback("--fullSync", (under) =>
        {
            function displayInitialObjects()
            {
                root.getElementBySid("main--svg").innerHTML = "";
                this.displayedObjects = {};

                for (const name in under.objects)
                {
                    loadXmlObject(under.objects[ name ], root, this.resourceDirectory).then((result) =>
                    {
                        this.displayedObjects[ name ] = result;
                    });
                }
            }

            if (root.ready)
            {
                displayInitialObjects();
                return;
            }

            root.onReady.push(() =>
            {
                displayInitialObjects();
            });
        });
    }
    onDestroy(root: SubDoc, name: string)
    {
        this.connector.onDestroy();
    }
    onSave(root: SubDoc, name: string)
    {

    }


};;