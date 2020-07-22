import { DrawObject, DrawObjectPure } from "./draw-object.js";
import { SyncObject } from "./sync_alt/SyncObject.js";
import { SyncConnector } from "./sync_alt/SyncConnector.js";
import { SyncOrganizerType } from "./sync_alt/SyncOrganizer.js";
import { Serializable, SerializeObject } from "./Serializable.js";

export interface DrawObjectTreePure
{
    rootObjects: string[];
    objects: { [ name: string ]: DrawObjectPure; };
}

export interface DrawObjectTreeInterface
{
    AddObject(object: DrawObject): void;
    AddObjectToRoot(object: DrawObject): void;
    HasObject(name: string): boolean;
    ToPureObject(): DrawObjectTreePure;
    FromPureObject(object: DrawObjectTreePure): DrawObjectTree;
}

export class DrawObjectTree implements Serializable
{
    rootObjects: DrawObject[] = [];
    objects: { [ name: string ]: DrawObject; } = {};

    AddObject(object: DrawObject): void
    {
        this.objects[ object.name ] = object;
        if (object.parent === null)
        {
            this.rootObjects.push(object);
        }
    }

    /**
     * 
     * @deprecated use DrawObjectTree.AddObject instead,
     * this will automatically add it to root when applicable
     * 
     * @param object object that should be added
     */
    AddObjectToRoot(object: DrawObject): void
    {
        this.objects[ object.name ] = object;
        this.rootObjects.push(object);
    }

    HasObject(name: string): boolean
    {
        return (name in this.objects);
    }

    /**
     * @deprecated use DrawObjectTree.serialize instead
     */
    ToPureObject(): DrawObjectTreePure
    {
        return {
            rootObjects: this.rootObjects.map(object => object.name),
            objects: (() =>
            {
                let result: { [ name: string ]: DrawObjectPure; } = {};
                for (let name in this.objects)
                {
                    result[ name ] = this.objects[ name ].ToPureObject();
                }
                return result;
            })()
        };
    }

    /**
     * @deprecated use DrawObjectTree.deserialize instead
     */
    FromPureObject(object: DrawObjectTreePure): this
    {
        for (let name in object.objects)
        {
            this.objects[ name ] = new DrawObject().FromPureObject(object.objects[ name ]);
        }
        for (let name in object.objects)
        {
            if (this.objects[ name ].parent === null)
            {
                continue;
            }

            let currentObject = this.objects[ name ];
            currentObject.parent = this.objects[ <string>currentObject.parent ]; //assume string type
        }

        this.rootObjects = object.rootObjects.map(name => this.objects[ name ]);
        return this;
    }

    constructor (rootObject: DrawObject[] = [])
    {
        this.rootObjects = rootObject;
        rootObject.forEach(rootObject =>
        {
            this.objects[ rootObject.name ] = rootObject;
        });
    }
    serialize(): SerializeObject
    {
        return <any>this.ToPureObject();
    }
    deserialize(serialized: SerializeObject): this
    {
        return this.FromPureObject(<any>serialized);
    }
}

export class DrawObjectTreeWrapper implements DrawObjectTreeInterface
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

    constructor (organizerType: SyncOrganizerType, connector: SyncConnector, drawObjectTree: DrawObjectTree = new DrawObjectTree())
    {
        this.under = new SyncObject<DrawObjectTree>(organizerType, connector, drawObjectTree, under => under.ToPureObject(), recieved => (new DrawObjectTree().FromPureObject(recieved)));
    }
}