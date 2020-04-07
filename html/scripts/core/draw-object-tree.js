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

        for (name in this.objects)
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
        for (name in object.objects)
        {
            let newDrawObject = new DrawObject();
            newDrawObject.FromPureObject(object.objects[name]);
            this.objects[name] = newDrawObject;
        }

        for (let i = 0; i < object.rootObjects.length; ++i)
        {
            this.rootObjects.push(this.objects[object.rootObjects[i]]);
        }
    }

    constructor(rootObjects = [])
    {
        this.rootObjects = rootObjects;
    }
}

module.exports.DrawObjectTree = DrawObjectTree;
module.exports.DrawObject = DrawObject;