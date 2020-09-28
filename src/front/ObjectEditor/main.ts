import {DrawObject,
    DrawObjectTreeEditorWrapper,
    SyncOrganizerType,
    TransformCommand} from "../core/core.js";
import {Tab, TabContentImplementation} from "../global/tabs_alt.js";
import {updateTextTree, updateTransformCommands} from "./Updates.js";
import {SubDoc} from "../global/subdoc_alt.js";
import {SyncConnectorFront} from "../global/SyncConnector_Front.js";
import {OnScriptLoad as loadDropdown} from "../global/dropdown.js";

const {dialog} = require("electron").remote;
const currentWindow = require("electron").remote.getCurrentWindow();
const {ipcRenderer} = require("electron");

// const REGEX_XML_CONTENT = /^<root>([^]*)<\/root>$/iu;
const REGEX_REPLACE_SPACES = / /gu;

/*
 * const DIRTY_TAB_BY_ACTION = new Set([
 *     "AddObject",
 *     "AddObjectToRoot",
 *     "FromPureObject",
 *     "renameObject",
 *     "deserialize",
 *     "addTransformCommand",
 *     "updateTransformCommandField"
 * ]);
 */

const UPDATE_TEXT_TREE_BY_ACTIONS = new Set([
    "AddObject",
    "AddObjectToRoot",
    "FromPureObject",
    "selectObject",
    "renameObject",
    "deserialize",
    "--fullSync"
]);

const UPDATE_ALL_BY_ACTIONS = new Set([
    "--fullSync",
    "deserialize"
]);

const UPDATE_TRANSFORM_COMMANDS_BY_ACTIONS = new Set([
    "selectObject",
    "addTransformCommand",
    "deserialize",
    "--fullSync"
]);

const UPDATE_SELECTED_OBJECT_BY_ACTION = new Set([
    "selectObject",
    "FromPureObject",
    "deserialize",
    "--fullSync"
]);

const UPDATE_TRANSFORM_BY_ACTIONS = new Set([
    "addTransformCommand",
    "updateTransformCommandField",
    "FromPureObject",
    "deserialize",
    "--fullSync"
]);

const SINGLE_TRANSFORM_UPDATE = new Set([
    "addTransformCommand",
    "updateTransformCommandField"
]);

function sidToUniqueId (name: string, sid: string) {

    return `---${
        name.toLowerCase().replace(REGEX_REPLACE_SPACES, "-")
    }--${
        sid}`;

}

function onChangeName (root: SubDoc, name: string) {

    (<HTMLElement>root.getElementBySid("property--name")).innerText = name;
    (<HTMLInputElement>root
        .getElementBySid("property--name-input")).value = name;

}

function onRename (
    _event: KeyboardEvent,
    nameInput: HTMLInputElement,
    tree: DrawObjectTreeEditorWrapper
) {

    const validateResult = tree.validateName(nameInput.value);

    if (!validateResult.success) {

        dialog.showMessageBox(currentWindow, {
            type: "warning",
            message: (<{ success: false; message: string; }>validateResult)
                .message
        });

        return;

    }

    tree.renameObject(tree.under.under.selectedObject, nameInput.value);

}

function loadXmlObject (
    newObject: DrawObject,
    root: SubDoc,
    resourceDirectory: string
): Promise<SVGGElement> {

    const resourceLoaction = `${resourceDirectory}/${newObject.name}.xml`;
    const objectRequest = new window.XMLHttpRequest();

    objectRequest.open("GET", resourceLoaction);

    return new Promise((resolve) => {

        objectRequest.onload = () => {

            const svgContent = objectRequest.response;

            const newGroup
            = document.createElementNS("http://www.w3.org/2000/svg", "g");

            newGroup.innerHTML = svgContent;

            newGroup.setAttribute(
                "transform",
                newObject.worldTransform().svgString()
            );

            root.getElementBySid("main--svg--content").appendChild(newGroup);
            resolve(newGroup);

        };
        objectRequest.send();

    });


}

export class ObjectEditor implements TabContentImplementation {

    drawObjectTree: DrawObjectTreeEditorWrapper;

    resourceDirectory: string;

    displayedObjects: { [ name: string ]: SVGGElement; };

    currentDisplayedAsSelected: SVGGElement;

    connector: SyncConnectorFront;

    enableSave: boolean;

    constructor () {

        this.resourceDirectory = "../saved/objects";
        this.displayedObjects = {};
        this.currentDisplayedAsSelected = null;
        this.enableSave = true;

    }

    // todo: shorten function
    // eslint-disable-next-line max-lines-per-function
    onInit (root: SubDoc, name: string, tab: Tab): void {

        this.connector = new SyncConnectorFront("draw-object-tree");
        this.drawObjectTree = new DrawObjectTreeEditorWrapper(
            SyncOrganizerType.SUBSCRIBER,
            this.connector
        );
        this.drawObjectTree.under.organizer.requestSync();

        loadDropdown(root.root);

        root.getElementBySid("filter--selected-svg-object").id
         = sidToUniqueId(name, "filter--selected-svg-object");

        const addControlsElement
        = root.getElementBySid("property--transform-add-controls");

        Array.from(addControlsElement.children)
            .forEach((child: HTMLButtonElement) => {

                child.addEventListener("click", () => {

                    this.drawObjectTree.addTransformCommand(
                        this.drawObjectTree.under.under.selectedObject,
                        new TransformCommand(child.dataset.transformCommandType)
                    );

                });

            });


        const nameInput
        = <HTMLInputElement>root.getElementBySid("property--name-input");

        nameInput.addEventListener("keydown", (event: KeyboardEvent) => {

            if (event.key !== "Enter") {

                return;

            }

            onRename(event, nameInput, this.drawObjectTree);

        });

        this.drawObjectTree.under.under.onDirty = () => {

            tab.dirty = true;

        };
        this.drawObjectTree.under.under.onClean = () => {

            tab.dirty = false;

        };
        this.drawObjectTree.under.addActionCallback("--fullSync", (under) => {

            under.onDirty = () => {

                tab.setDirty();

            };
            under.onClean = () => {

                tab.dirty = false;

            };

        });

        this.drawObjectTree.under
            .addAllActionCallback((action, under, argumentList: [ string ]) => {

                const [object] = argumentList;

                if (!UPDATE_TRANSFORM_BY_ACTIONS.has(action)) {

                    return;

                }

                const updateList = SINGLE_TRANSFORM_UPDATE.has(action)
                    ? [object]
                    : Object.keys(under.objects);


                updateList.forEach((targetObject) => {

                    if (!(targetObject in this.displayedObjects)) {

                        return;

                    }
                    this.displayedObjects[targetObject].setAttribute(
                        "transform",
                        under.objects[targetObject].worldTransform().svgString()
                    );

                });

            });

        this.drawObjectTree.under.addAllActionCallback((action, under) => {

            if (this.currentDisplayedAsSelected) {

                this.currentDisplayedAsSelected.setAttribute("filter", "");
                this.currentDisplayedAsSelected = null;

            }

            if (!UPDATE_SELECTED_OBJECT_BY_ACTION.has(action)) {

                return;

            }

            if (!under.selectedObject) {

                return;

            }

            this.displayedObjects[under.selectedObject].setAttribute(
                "filter",
                `url(#${sidToUniqueId(name, "filter--selected-svg-object")})`
            );
            this.currentDisplayedAsSelected
            = this.displayedObjects[under.selectedObject];

        });

        this.drawObjectTree.under.addAllActionCallback((action, under) => {

            if (!UPDATE_TEXT_TREE_BY_ACTIONS.has(action)) {

                return;

            }

            if (root.ready) {

                updateTextTree(root, this.drawObjectTree, under);

                return;

            }

            root.onReady.push(() => {

                updateTextTree(root, this.drawObjectTree, under);

            });

        });

        this.drawObjectTree.under.addAllActionCallback((action, under) => {

            if (!UPDATE_TRANSFORM_COMMANDS_BY_ACTIONS.has(action)
            || !this.drawObjectTree.under.under.selectedObject) {

                return;

            }

            if (root.ready) {

                updateTransformCommands(root, this.drawObjectTree, under);

                return;

            }

            root.onReady.push(() => {

                updateTransformCommands(root, this.drawObjectTree, under);

            });

        });

        this.drawObjectTree.under.addActionCallback(
            "selectObject",
            (under) => {

                onChangeName(root, under.selectedObject);

            }
        );

        this.drawObjectTree.under.addActionCallback(
            "AddObjectToRoot",
            (_under, argumentList: [ DrawObject ]) => {

                loadXmlObject(
                    argumentList[0],
                    root,
                    this.resourceDirectory
                ).then((result) => {

                    this.displayedObjects[argumentList[0].name] = result;
                    result.setAttribute(
                        "filter",
                        `url(#${sidToUniqueId(
                            name,
                            "filter--selected-svg-object"
                        )})`
                    );
                    result.addEventListener("click", () => {

                        this.drawObjectTree.selectObject(argumentList[0].name);

                    });

                });

            }
        );

        this.drawObjectTree.under.addActionCallback(
            "renameObject",
            (_under, argumentList: [ string, string ]) => {

                const [oldName, newName] = argumentList;

                if (!(oldName in this.displayedObjects)) {

                    console.warn(`object '${
                        oldName}' is not tracked for display`);

                    return;

                }

                this.displayedObjects[newName] = this.displayedObjects[oldName];
                delete this.displayedObjects[oldName];

            }
        );
        const self = this;

        this.drawObjectTree.under.addAllActionCallback((action, under) => {

            if (!UPDATE_ALL_BY_ACTIONS.has(action)) {

                return;

            }
            function displayInitialObjects () {

                root.getElementBySid("main--svg--content").innerHTML = "";
                self.displayedObjects = {};

                for (const objectName in under.objects) {

                    if (!Object.prototype.hasOwnProperty
                        .call(under.objects, objectName)) {

                        continue;

                    }
                    loadXmlObject(
                        under.objects[objectName],
                        root,
                        self.resourceDirectory
                    ).then((result) => {

                        self.displayedObjects[objectName] = result;
                        result.addEventListener("click", () => {

                            self.drawObjectTree.selectObject(objectName);

                        });

                    });

                }

            }

            if (root.ready) {

                displayInitialObjects();

                return;

            }

            root.onReady.push(() => {

                displayInitialObjects();

            });

        });
        ipcRenderer.send("open-object-editor", {});

    }

    onDestroy (): void {

        ipcRenderer.send("close-object-editor", {});
        this.connector.onDestroy();

    }

    onSave (): void {

        ipcRenderer.send("save-tab", {
            type: "draw-object-tree"
        });
        this.drawObjectTree.under.under.dirty = false;

    }


}
