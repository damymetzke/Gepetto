import { DrawObjectTree } from "../draw-object-tree.js";
import { TransformCommandType, TransformCommand } from "../transform-command.js";
import { DrawObject } from "../draw-object.js";
import { SynchronizedObject, SynchronizedTransformCommand } from "./synchronized-object.js";

export type SyncData = { [ key: string ]: any; };
/**
 * function that will be called whenever an action is recieved
 * 
 * @param action string identifying the action taken
 * @param data data recieved
 * 
 * @see SynchronizedTree.AddRecieveActionListner
 */
type RecieveActionListner = (action: string, data: SyncData) => void;

/**
 * function that will be called when a specific action is called
 * 
 * @param data data send with the action
 * @param result the resulting data, this is fully defined by each specific action
 * 
 * @see SynchronizedTree.AddActionListner
 */
type ActionListner = (data: SyncData, result: any) => void;

//action data interfaces
interface ChangeNameData
{
    originalObject: string,
    newName: string;
}

const ACTION_EFFECTS: { [ action: string ]: (syncTree: SynchronizedTree, data: SyncData) => any; } = {
    "change-name": (syncTree: SynchronizedTree, data: ChangeNameData) =>
    {
        syncTree._tree.objects[ data.newName ] = syncTree._tree.objects[ data.originalObject ];
        delete syncTree._tree.objects[ data.originalObject ];
        syncTree._tree.objects[ data.newName ].name = data.newName;

        syncTree.NotifyNameChange(data.originalObject, data.newName);

        return syncTree._tree.objects[ data.newName ];
    }
};

export interface SyncMessage
{
    action: string;
    data: SyncData;
}

/**
 * class used to synchronize 2 independent DrawObjectTree instances
 * 
 * this class is meant as a base class and should *never* be instanced without extending it.
 * Any extending class has 2 purposes:
 * * override SynchronizedTree.SendAction:
 * this function should send the action taken to the other object using whatever means nescesary.
 * * call RecieveAction whenever the other object has send an action to this object
 * 
 * @see SynchronizedTreeLog
 * @see SynchronizedTreeBack
 * @see SynchronizedTreeFront
 */
export class SynchronizedTree
{
    _tree: DrawObjectTree = new DrawObjectTree();

    _followedSynchronizedObjects: { [ name: string ]: SynchronizedObject[]; } = {};
    _focus: SynchronizedTransformCommand = new SynchronizedTransformCommand(this, "", -1);

    _recieveActionListners: RecieveActionListner[] = [];
    _actionListners: { [ action: string ]: ActionListner[]; } = {};

    /**
     * called when an action is taken on this class.
     * 
     * any implementation should override this and provide a way to communicate to the other synchronized class.
     * an exception is SynchronizedTreeLog, which will only log the changes.
     * 
     * @param action a string used to identify the type of action
     * @param data data send to the other synchronized tree
     */
    SendAction(action: string, data: SyncData): void
    {
        console.error("❗ SynchronizedTree.SendAction was called, but it is expected to be overridden. Make sure to only instance child classes.");
        console.groupCollapsed("SendActionErrorData");
        console.log(`Action send: '${action}'`);
        console.table(data);
        console.groupEnd();
    }

    /**
     * should be called, by a class that overrides this class, whenever the other sycnhronized class sends an action.
     * 
     * @param action a string used to identify the type of action
     * @param data data recieved from the other synchronized tree
     */
    RecieveAction(action: string, data: SyncData): void
    {
        this._recieveActionListners.forEach(listner =>
        {
            listner(action, data);
        });

        if (!(action in ACTION_EFFECTS))
        {
            return;
        }

        const result = ACTION_EFFECTS[ action ](this, data);

        if (!(action in this._actionListners))
        {
            return;
        }

        this._actionListners[ action ].forEach(listner => listner(data, result));
    }

    /**
     * add a new listner to be directly called whenever an action is recieved.
     * 
     * @param listner callback function
     * 
     * @see RecieveActionListner
     */
    AddRecieveActionListner(listner: RecieveActionListner)
    {
        this._recieveActionListners.push(listner);
    }

    /**
     * 
     * @param action string representing the action that should be taken
     * @param listner callback function
     * 
     * @see ActionListner
     */
    AddActionListner(action: string, listner: ActionListner)
    {
        if (!(action in this._actionListners))
        {
            this._actionListners[ action ] = [ listner ];
            return;
        }

        this._actionListners[ action ].push(listner);
    }

    /**
     * updates all followed synchronized objects whenever a name changes.
     * 
     * the name needs to be updated, or the system stops working.
     * 
     * @param name original name
     * @param newName updated name
     */
    NotifyNameChange(name: string, newName: string)
    {
        if (name in this._followedSynchronizedObjects)
        {
            this._followedSynchronizedObjects[ newName ] = this._followedSynchronizedObjects[ name ];
            delete this._followedSynchronizedObjects[ name ];
            this._followedSynchronizedObjects[ newName ].forEach(followed =>
            {
                followed.objectName = newName;
            });
        }

        if (this._focus.objectName === name)
        {
            this._focus.objectName = newName;
        }
    }

    /** 
     * @returns the actively focused object. (this will be automatically updated as the focus changes)
     */
    Focus(): SynchronizedTransformCommand
    {
        return this._focus;
    }

    AddObject(name: string): SynchronizedObject
    {
        this._tree.objects[ name ] = new DrawObject(name);
        this._tree.rootObjects.push(this._tree.objects[ name ]);
        this.SendAction("add-object", { name: name });

        let result = new SynchronizedObject(this, name);
        if (!(name in this._followedSynchronizedObjects))
        {
            this._followedSynchronizedObjects[ name ] = [];
        }
        this._followedSynchronizedObjects[ name ].push(result);
        return result;
    }

    ChangeName(object: SynchronizedObject, newName: string): void
    {
        this._tree.objects[ newName ] = this._tree.objects[ object.objectName ];
        delete this._tree.objects[ object.objectName ];
        this._tree.objects[ newName ].name = newName;

        this.SendAction("change-name", {
            originalObject: object.objectName,
            newName: newName
        });

        this.NotifyNameChange(object.objectName, newName);
    }

    Reparent(object: SynchronizedObject, newParent: SynchronizedObject): void
    {
        this.SendAction("reparent", {
            child: object.objectName,
            parent: newParent.objectName
        });
    }

    SelectObject(object: SynchronizedObject): void
    {
        this.SendAction("select-object", { object: object.objectName });

        this._focus.objectName = object.objectName;
        this._focus.transformCommandIndex = -1;
    }

    AddTransformCommand(object: SynchronizedObject, type: TransformCommandType): SynchronizedTransformCommand
    {
        this.SendAction("add-transform-command", {
            object: object.objectName,
            type: type
        });

        this._tree.objects[ object.objectName ].transformCommands.push(new TransformCommand(type));

        const result = new SynchronizedTransformCommand(this, object.objectName, this._tree.objects[ object.objectName ].transformCommands.length - 1);

        this._followedSynchronizedObjects[ object.objectName ].push(result);
        //todo: implement this proprly such that it is followed properly and such

        return result;
    }

    RemoveTransformCommand(command: SynchronizedTransformCommand): void
    {
        this.SendAction("remove-transform-command", {
            object: command.objectName,
            command: command.transformCommandIndex
        });
    }

    SelectTransformCommand(command: SynchronizedTransformCommand): void
    {
        this.SendAction("select-transform-command", {
            object: command.objectName,
            command: command.transformCommandIndex
        });
    }
}