const { DrawObject } = require("./draw-object");

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