import { SubDoc } from "../global/subdoc_alt.js";
import { TabContentImplementation } from "../global/tabs_alt.js";
import { DrawObjectTreeWrapper, DrawObject } from "../core/core.js";
import { SyncOrganizerType } from "../core/sync_alt/SyncOrganizer.js";
import { SyncConnector_Front } from "../global/SyncConnector_Front.js";

export class ObjectEditor implements TabContentImplementation
{
    drawObjectTree: DrawObjectTreeWrapper;

    onInit(root: SubDoc, name: string)
    {
        this.drawObjectTree = new DrawObjectTreeWrapper(SyncOrganizerType.SUBSCRIBER, new SyncConnector_Front("draw-object-tree"));
        this.drawObjectTree.under.organizer.requestSync();

        console.log("<(￣ c￣)y▂ξ");

        this.drawObjectTree.AddObject(new DrawObject("a"));
    }
    onDestroy(root: SubDoc, name: string)
    {

    }
    onSave(root: SubDoc, name: string)
    {

    }
}