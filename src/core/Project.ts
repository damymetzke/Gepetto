import { Serializable, SerializeObject } from "./Serializable.js";
import { GepettoFileVersion, GEPETTO_FILE_VERSION } from "./Globals.js";
import { DrawObjectTreeEditorWrapper } from "./DrawObjectTreeEditor.js";

export interface SerializedProject extends SerializeObject
{
    tree: SerializeObject;
    projectName: string;
}

export class Project implements Serializable
{
    projectFile: string;
    projectName: string;
    fileVersion: GepettoFileVersion;

    drawObjectTree: DrawObjectTreeEditorWrapper;

    constructor (drawObjectTree: DrawObjectTreeEditorWrapper = null)
    {
        this.drawObjectTree = drawObjectTree;
        this.projectName = "Gepetto Project";
        this.fileVersion = GEPETTO_FILE_VERSION;
    }

    serialize(): SerializeObject
    {
        return {
            tree: this.drawObjectTree.serialize(),
            projectName: this.projectName
        };
    }
    deserialize(serialized: SerializedProject): this
    {
        const { tree, projectName } = serialized;

        this.drawObjectTree.deserialize(tree);
        this.projectName = projectName;

        return this;
    }

}