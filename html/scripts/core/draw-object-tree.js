const { DrawObject } = require("./draw-object");

class DrawObjectTree
{
    rootObjects = [];

    HasObject(name)
    {
        for (let i = 0; i < this.rootObjects.length; ++i)
        {
            if (this.rootObjects[i].HasObject(name))
            {
                return true;
            }
        }

        return false;
    }

    constructor(rootObjects = [])
    {
        this.rootObjects = rootObjects;
    }
}

module.exports.DrawObjectTree = DrawObjectTree;
module.exports.DrawObject = DrawObject;