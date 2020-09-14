import {DrawObject, SerializedDrawObject} from "./DrawObject.js";
import {Serializable, SerializeObject} from "./Serializable.js";
import {SyncConnector} from "./sync/SyncConnector.js";
import {SyncObject} from "./sync/SyncObject.js";
import {SyncOrganizerType} from "./sync/SyncOrganizer.js";

export interface SerializedDrawObjectTree
{
    rootObjects: string[];
    objects: { [ name: string ]: SerializedDrawObject; };
}

export class DrawObjectTree implements Serializable {

    rootObjects: DrawObject[] = [];

    objects: { [ name: string ]: DrawObject; } = {};

    AddObject (object: DrawObject): void {

        this.objects[object.name] = object;
        if (object.parent === null) {

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
    AddObjectToRoot (object: DrawObject): void {

        this.objects[object.name] = object;
        this.rootObjects.push(object);

    }

    HasObject (name: string): boolean {

        return (name in this.objects);

    }

    /**
     * @deprecated use {@link DrawObjectTree.serialize} instead.
     */
    ToPureObject (): SerializedDrawObjectTree {

        return {
            rootObjects: this.rootObjects.map((object) => object.name),
            objects: (() => {

                const result: { [ name: string ]: SerializedDrawObject; } = {};

                for (const name in this.objects) {

                    if (!Object.prototype.hasOwnProperty
                        .call(this.objects, name)) {

                        continue;

                    }

                    result[name] = this.objects[name].serialize();

                }

                return result;

            })()
        };

    }

    /**
     * @deprecated use {@link DrawObjectTree.deserialize} instead.
     */
    FromPureObject (object: SerializedDrawObjectTree): this {

        for (const name in object.objects) {

            if (!Object.prototype.hasOwnProperty
                .call(this.objects, name)) {

                continue;

            }
            this.objects[name] = new DrawObject()
                .deserialize(object.objects[name]);

        }
        for (const name in object.objects) {

            if (this.objects[name].parent === null) {

                continue;

            }

            const currentObject = this.objects[name];

            // assume string type
            currentObject.parent = this.objects[<string>currentObject.parent];

        }

        this.rootObjects = object.rootObjects.map((name) => this.objects[name]);

        return this;

    }

    constructor (rootObject: DrawObject[] = []) {

        this.rootObjects = rootObject;
        rootObject.forEach((rootObject) => {

            this.objects[rootObject.name] = rootObject;

        });

    }

    serialize (): SerializeObject {

        return <any> this.ToPureObject();

    }

    deserialize (serialized: SerializeObject): this {

        return this.FromPureObject(<any>serialized);

    }

    reset (): void {

        this.rootObjects = [];
        this.objects = {};

    }

}

export interface DrawObjectTreeInterface
{
    AddObject(object: DrawObject): void;
    AddObjectToRoot(object: DrawObject): void;
    HasObject(name: string): boolean;
    ToPureObject(): SerializedDrawObjectTree;
    FromPureObject(object: SerializedDrawObjectTree): DrawObjectTree;
}

export class DrawObjectTreeWrapper implements DrawObjectTreeInterface {

    under: SyncObject<DrawObjectTree>;

    AddObject (object: DrawObject): void {

        this.under.runAction({action: "AddObject",
            argumentList: [object]});

    }

    AddObjectToRoot (object: DrawObject): void {

        this.under.runAction({action: "AddObjectToRoot",
            argumentList: [object]});

    }

    HasObject (name: string): boolean {

        return this.under.under.HasObject(name);

    }

    ToPureObject (): SerializedDrawObjectTree {

        return this.under.under.ToPureObject();

    }

    FromPureObject (object: SerializedDrawObjectTree): DrawObjectTree {

        this.under.runAction({action: "FromPureObject",
            argumentList: [object]});

        return this.under.under;

    }

    constructor (
        organizerType: SyncOrganizerType,
        connector: SyncConnector,
        drawObjectTree: DrawObjectTree = new DrawObjectTree()
    ) {

        this.under = new SyncObject<DrawObjectTree>(
            organizerType,
            connector,
            drawObjectTree,
            (under) => under.ToPureObject(),
            (recieved) => (new DrawObjectTree().FromPureObject(recieved))
        );

    }

}
