import {GEPETTO_FILE_VERSION, GepettoFileVersion} from "./Globals.js";
import {Serializable, SerializeObject} from "./Serializable.js";

export interface SerializedProject extends SerializeObject
{
    tree: SerializeObject;
    projectName: string;
}

export class Project implements Serializable {

    projectFile: string;

    projectName: string;

    fileVersion: GepettoFileVersion;

    constructor () {

        this.projectName = "Gepetto Project";
        this.fileVersion = GEPETTO_FILE_VERSION;

    }

    serialize (): SerializeObject {

        return {
            projectName: this.projectName,
            fileVersion: this.fileVersion
        };

    }

    deserialize (serialized: SerializedProject): this {

        const {projectName, fileVersion} = serialized;

        this.projectName = projectName;
        this.fileVersion = <GepettoFileVersion>fileVersion;

        return this;

    }

}
