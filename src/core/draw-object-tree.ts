import { DrawObject, DrawObjectPure } from "./draw-object";

export interface DrawObjectTreePure
{
    rootObjects: string[];
    objects: { [name: string]: DrawObjectPure; };
}

export class DrawObjectTree
{
    rootObjects: DrawObject[] = [];
    objects: { [name: string]: DrawObject; } = {};

    AddObject(object: DrawObject): void
    {
        this.objects[object.name] = object;
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
        this.objects[object.name] = object;
        this.rootObjects.push(object);
    }

    HasObject(name: string): boolean
    {
        return (name in this.objects);
    }

    ToPureObject(): DrawObjectTreePure
    {
        return {
            rootObjects: this.rootObjects.map(object => object.name),
            objects: (() =>
            {
                let result: { [name: string]: DrawObjectPure; } = {};
                for (let name in this.objects)
                {
                    result[name] = this.objects[name].ToPureObject();
                }
                return result;
            })()
        };
    }

    FromPureObject(object: DrawObjectTreePure): DrawObjectTree
    {
        for (let name in object.objects)
        {
            this.objects[name] = new DrawObject().FromPureObject(object.objects[name]);
        }
        for (let name in object.objects)
        {
            if (this.objects[name].parent === null)
            {
                continue;
            }

            let currentObject = this.objects[name];
            currentObject.parent = this.objects[<string>currentObject.parent]; //assume string type
        }

        this.rootObjects = object.rootObjects.map(name => this.objects[name]);
        return this;
    }

    constructor(rootObject: DrawObject[] = [])
    {
        this.rootObjects = rootObject;
        rootObject.forEach(rootObject =>
        {
            this.objects[rootObject.name] = rootObject;
        });
    }
}