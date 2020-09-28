import {DrawObjectTree, SerializedDrawObjectTree} from "./DrawObjectTree.js";
import {Serializable, SerializeObject} from "./Serializable.js";
import {DrawObject} from "./DrawObject.js";
import {SyncConnector} from "./sync/SyncConnector.js";
import {SyncObject} from "./sync/SyncObject.js";
import {SyncOrganizerType} from "./sync/SyncOrganizer.js";
import {TransformCommand} from "./TransformCommand.js";

const REGEX_VALIDATE_IMPORT_NAME = /^[a-z][a-z0-9_]*$/iu;

type verifyResult =
    {
        success: true;
    }
    |
    {
        success: false;
        message: string;
    };

/**
 * @see DrawObjectTreeEditor
 */
export interface DrawObjectTreeEditorInterface extends Serializable
{
    AddObject(object: DrawObject): void;
    AddObjectToRoot(object: DrawObject): void;
    HasObject(name: string): boolean;
    ToPureObject(): SerializedDrawObjectTree;
    FromPureObject(object: SerializedDrawObjectTree): DrawObjectTree;
    addTransformCommand(object: string, command: TransformCommand): void;
    selectObject(object: string): void;
    validateName(testName: string): verifyResult;
    renameObject(object: string, newName: string): void;
    updateTransformCommandField(object: string,
         command: number, field: string,
          value: number): void;
    notifySave(): void;
}

export class DrawObjectTreeEditor
    extends DrawObjectTree
    implements DrawObjectTreeEditorInterface {

    selectedObject: string;

    _dirty: boolean;

    onDirty?: () => void;

    onClean?: () => void;

    set dirty (value: boolean) {

        console.log(String(this._dirty), " => ", String(value));
        if (value === this._dirty) {

            return;

        }

        this._dirty = value;

        if (value) {

            console.log("onDirty: ", this.onDirty);
            if (this.onDirty) {

                this.onDirty();

            }

        } else {

            console.log("onClean: ", this.onClean);
            if (this.onClean) {

                this.onClean();

            }

        }

    }

    get dirty (): boolean {

        return this._dirty;

    }


    /**
     * @deprecated use lowercase instead.
     */
    AddObject (object: DrawObject): void {

        this.addObject(object);

    }

    addObject (object: DrawObject): void {

        super.addObject(object);
        this.selectedObject = object.name;
        this.dirty = true;

    }

    /**
     * @deprecated DrawObjectTreeEditor.addObject instead.
     */
    AddObjectToRoot (object: DrawObject): void {

        super.addObject(object);
        this.selectedObject = object.name;
        this.dirty = true;

    }

    addTransformCommand (object: string, command: TransformCommand): void {

        if (!(object in this.objects)) {

            console.warn("attempt to add command to DrawObjectTreeController"
            + `failed because ${object} does not exist`);

        }

        this.objects[object].AddTransformCommand(command);
        this.dirty = true;

    }

    selectObject (object: string): void {

        this.selectedObject = object;

    }

    validateName (testName: string): verifyResult {

        if (!testName) {

            return {
                success: false,
                message: "Name cannot be empty"
            };

        }

        if (!REGEX_VALIDATE_IMPORT_NAME.test(testName)) {

            return {
                success: false,
                message: "Name can only contain alphanumerical"
                + "characters and underscore('_')\n"
                + "Name should always start with an alphabetic character (a-z)"
            };

        }

        if (this.HasObject(testName)) {

            return {
                success: false,
                message: "Name is already in use"
            };

        }

        return {
            success: true
        };

    }

    renameObject (object: string, newName: string): void {

        if (object === newName) {

            return;

        }

        if (!this.validateName(newName).success) {

            return;

        }

        this.objects[object].name = newName;
        this.objects[newName] = this.objects[object];
        delete this.objects[object];

        if (this.selectedObject === object) {

            this.selectedObject = newName;

        }
        this.dirty = true;

    }

    updateTransformCommandField (
        object: string,
        command: number,
        field: string,
        value: number
    ): void {

        if (!(object in this.objects)) {

            return;

        }

        const targetObject = this.objects[object];

        if (command >= targetObject.transformCommands.length) {

            return;

        }

        const targetCommand = targetObject.transformCommands[command];

        targetCommand.fields[field] = value;
        this.dirty = true;

    }

    constructor (rootObject: DrawObject[] = []) {

        super(rootObject);
        this._dirty = false;

    }

    notifySave (): void {

        this.dirty = false;

    }

    deserialize (serialized: SerializeObject): this {

        this.dirty = false;

        return super.deserialize(<SerializedDrawObjectTree>serialized);

    }

    reset (): void {

        this.dirty = false;
        super.reset();

    }

}

/**
 * wrapper function for object synchonization
 * 
 * @see DrawObjectTreeEditor
 * @see SyncObject
 */
export class DrawObjectTreeEditorWrapper
implements DrawObjectTreeEditorInterface {

    under: SyncObject<DrawObjectTreeEditor>;

    AddObject (object: DrawObject): void {

        this.under.runAction({action: "AddObject",
            argumentList: [object]});

    }

    AddObjectToRoot (object: DrawObject): void {

        this.under.runAction({action: "AddObjectToRoot",
            argumentList: [object]});

    }

    HasObject (name: string): boolean {

        return this.under.under.hasObject(name);

    }

    ToPureObject (): SerializedDrawObjectTree {

        // should be removed anyway
        // eslint-disable-next-line new-cap
        return this.under.under.ToPureObject();

    }

    FromPureObject (object: SerializedDrawObjectTree): DrawObjectTree {

        this.under.runAction({action: "FromPureObject",
            argumentList: [object]});

        return this.under.under;

    }

    addTransformCommand (object: string, command: TransformCommand): void {

        this.under.runAction({action: "addTransformCommand",
            argumentList: [object, command]});

    }

    selectObject (object: string): void {

        this.under.runAction({action: "selectObject",
            argumentList: [object]});

    }

    validateName (testName: string): verifyResult {

        return this.under.under.validateName(testName);

    }

    renameObject (object: string, newName: string): void {

        this.under.runAction({action: "renameObject",
            argumentList: [object, newName]});

    }

    updateTransformCommandField (
        object: string,
        command: number,
        field: string,
        value: number
    ): void {

        this.under.runAction({action: "updateTransformCommandField",
            argumentList: [object, command, field, value]});

    }

    constructor (
        organizerType: SyncOrganizerType,
        connector: SyncConnector,
        drawObjectTree: DrawObjectTreeEditor = new DrawObjectTreeEditor()
    ) {

        this.under = new SyncObject<DrawObjectTreeEditor>(
            organizerType,
            connector,
            drawObjectTree,
            (under) => under.serialize(),
            // todo: fix this mess
            (recieved) => <DrawObjectTreeEditor>(new DrawObjectTreeEditor()
                .deserialize(<SerializedDrawObjectTree>recieved)),
            {
                AddObjectToRoot: {
                    ConvertToSend: (argumentList) => [
                        (<DrawObject>argumentList[0])
                            .ToPureObject()
                    ],
                    ConvertFromSend: (argumentList) => [
                        new DrawObject()
                            .FromPureObject(argumentList[0])
                    ]
                },
                addTransformCommand: {
                    ConvertToSend: (argumentList) => [
                        argumentList[0], (<TransformCommand>argumentList[1])
                            .ToPureObject()
                    ],
                    ConvertFromSend: (argumentList) => [
                        argumentList[0], new TransformCommand()
                            .FromPureObject(argumentList[1])
                    ]
                }
            }
        );

    }

    notifySave (): void {

        this.under.runAction({action: "notifySave",
            argumentList: []});

    }

    serialize (): SerializeObject {

        return this.under.under.serialize();

    }

    deserialize (serialized: SerializeObject): this {

        this.under.runAction({action: "deserialize",
            argumentList: [serialized]});

        return this;

    }

}
