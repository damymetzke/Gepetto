import { SubDoc } from "../global/subdoc_alt.js";
import { TabContentImplementation } from "../global/tabs_alt.js";
import { DrawObjectTreeEditorWrapper, DrawObject } from "../core/core.js";
import { SyncOrganizerType } from "../core/sync_alt/SyncOrganizer.js";
import { SyncConnector_Front } from "../global/SyncConnector_Front.js";
const ipcRenderer = require("electron");

const UPDATE_TEXT_TREE_BY_ACTIONS = new Set([
    "AddObject",
    "AddObjectToRoot",
    "FromPureObject",
    "--fullSync"
]);

export class ObjectEditor implements TabContentImplementation
{
    drawObjectTree: DrawObjectTreeEditorWrapper;

    onInit(root: SubDoc, name: string)
    {
        this.drawObjectTree = new DrawObjectTreeEditorWrapper(SyncOrganizerType.SUBSCRIBER, new SyncConnector_Front("draw-object-tree"));
        this.drawObjectTree.under.organizer.requestSync();

        this.drawObjectTree.under.addAllActionCallback((action, under) =>
        {
            if (!UPDATE_TEXT_TREE_BY_ACTIONS.has(action))
            {
                return;
            }

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
                textTreeList.appendChild(newChild);
            });
        });
    }
    onDestroy(root: SubDoc, name: string)
    {

    }
    onSave(root: SubDoc, name: string)
    {

    }


}