import { SubDoc } from "../global/subdoc_alt.js";
import { TabContentImplementation } from "../global/tabs_alt.js";
import { DrawObjectTree, DrawObjectTreeInterface, DrawObject, DrawObjectTreePure, SyncObject, SyncConnector } from "../core/core.js";
import { SyncOrganizerType } from "../core/sync_alt/SyncOrganizer.js";
import { SyncConnector_Front } from "../global/SyncConnector_Front.js";

class DrawObjectTreeWrapper implements DrawObjectTreeInterface
{
    under: SyncObject<DrawObjectTree>;

    AddObject(object: DrawObject): void
    {
        this.under.runAction({ action: "AddObject", argumentList: [ object ] });
    }
    AddObjectToRoot(object: DrawObject): void
    {
        this.under.runAction({ action: "AddObjectToRoot", argumentList: [ object ] });
    }
    HasObject(name: string): boolean
    {
        return this.under.under.HasObject(name);
    }
    ToPureObject(): DrawObjectTreePure
    {
        return this.under.under.ToPureObject();
    }
    FromPureObject(object: DrawObjectTreePure): DrawObjectTree
    {
        this.under.runAction({ action: "FromPureObject", argumentList: [ object ] });
        return this.under.under;
    }

    constructor (organizerType: SyncOrganizerType, connector: SyncConnector)
    {
        this.under = new SyncObject<DrawObjectTree>(organizerType, connector, new DrawObjectTree(), under => under.ToPureObject(), recieved => (new DrawObjectTree().FromPureObject(recieved)));
    }
}

export class ObjectEditor implements TabContentImplementation
{
    drawObjectTree: DrawObjectTreeWrapper;

    onInit(root: SubDoc, name: string)
    {
        this.drawObjectTree = new DrawObjectTreeWrapper(SyncOrganizerType.SUBSCRIBER, new SyncConnector_Front("draw-object-tree"));
        this.drawObjectTree.under.organizer.requestSync();

        console.log("<(￣ c￣)y▂ξ");
    }
    onDestroy(root: SubDoc, name: string)
    {

    }
    onSave(root: SubDoc, name: string)
    {

    }
}