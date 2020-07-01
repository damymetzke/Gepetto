import { DrawObjectTreeWrapper, SyncOrganizerType } from "../core/core";

import { SyncConnector_Back } from "../SyncConnector_Back";
import { BrowserWindow } from "electron";

export class DrawObjectManager
{
    drawObjectTree: DrawObjectTreeWrapper;

    constructor (window: BrowserWindow)
    {
        this.drawObjectTree = new DrawObjectTreeWrapper(SyncOrganizerType.OWNER, new SyncConnector_Back("draw-object-tree", window));
        this.drawObjectTree.under.addAllActionCallback((action, under, argumentList) =>
        {
            console.log(action, " >>> ", argumentList);
        });
    }
}