import { Serializable, SerializeObject } from "./Serializable.js";
import { DrawObjectTree } from "./draw-object-tree.js";

export interface SerializedProject extends SerializeObject
{
    tree: SerializeObject;
}

export class Project implements Serializable
{
    projectFile: string;

    drawObjectTree: DrawObjectTree;

    constructor (drawObjectTree: DrawObjectTree = null)
    {
        this.drawObjectTree = drawObjectTree;
    }

    serialize(): SerializeObject
    {
        return {
            "tree": this.drawObjectTree.serialize()
        };
    }
    deserialize(serialized: SerializedProject): this
    {
        const { tree } = serialized;

        this.drawObjectTree.deserialize(tree);

        return this;
    }

}