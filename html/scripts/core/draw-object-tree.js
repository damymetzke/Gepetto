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

    constructor(rootObjects = [])
    {
        this.rootObjects = rootObjects;
    }
}

module.exports.DrawObjectTree = DrawObjectTree;
module.exports.DrawObject = DrawObject;