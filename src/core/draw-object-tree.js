const { DrawObject } = require("./draw-object");

/**
 * contains a tree of DrawObject's
 * 
 * rootObjects contains all objects without a parent.
 * objects contains all objects, and the key is equal to the name of the object.
 * 
 * @see DrawObject
 */
class DrawObjectTree
{
    rootObjects = [];
    objects = {};

    AddObject(object)
    {
        this.objects[object.name] = object;
    }

    AddObjectToRoot(object)
    {
        this.objects[object.name] = object;
        this.rootObjects.push(object);
    }

    HasObject(name)
    {
        return (name in this.objects);
    }

    ToPureObject()
    {
        let result = {
            rootObjects: [],
            objects: {}
        };

        for (let name in this.objects)
        {
            result.objects[name] = this.objects[name].ToPureObject();
        }

        for (let i = 0; i < this.rootObjects.length; ++i)
        {
            result.rootObjects.push(result.objects[this.rootObjects[i].name]);
        }

        return result;
    }

    FromPureObject(object)
    {
        for (let name in object.objects)
        {
            let newDrawObject = new DrawObject();
            newDrawObject.FromPureObject(object.objects[name]);
            this.objects[name] = newDrawObject;
        }

        for (let i = 0; i < object.rootObjects.length; ++i)
        {
            console.log(this);
            this.rootObjects.push(this.objects[object.rootObjects[i].name]);
        }

        //todo: change names into objects
        for (let key in this.objects)
        {
            if (this.objects[key].parent === null)
            {
                continue;
            }

            const parentName = this.objects[key].parent;
            this.objects[key].parent = this.objects[parentName];
            this.objects[key].parent.children.push(this.objects[key]);
        }
    }

    constructor(rootObjects = [])
    {
        this.rootObjects = rootObjects;
    }
}

module.exports.DrawObjectTree = DrawObjectTree;
module.exports.DrawObject = DrawObject;