const { DrawObject } = require("./draw-object");

class DrawObjectTree
{
    rootObjects = [];

    constructor(rootObjects = [])
    {
        this.rootObjects = rootObjects;
    }
}

module.exports.DrawObjectTree = DrawObjectTree;
module.exports.DrawObject = DrawObject;