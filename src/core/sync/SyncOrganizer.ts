export type SyncAction = { action: string, argumentList: unknown[]; };

/**
 * the type of organizer dictates the role it plays in synchronizing.
 * 
 * the owner is the authority of the object, the subscriber is not.
 * any full synchronization will be done from owner to subscriber,
 * so the subscriber copies the owner's object.
 * the owner will send confirmation messages
 * and the subscriber will use those to verify proper order.
 */
export enum SyncOrganizerType
{
    NONE = 0,
    OWNER,
    SUBSCRIBER
}

/**
 * interface for the object in charge of fixing errors during synchronization.
 * 
 * this object is in charge of avoiding race conditions.
 * given the potentially asychronous nature of 2 synchronized classes
 * (e.g. synchronization between 2 servers), order is important.
 * if a situation is detected where the actions are taken in a different order,
 * this class is in charge of rectifying that mistake.
 * 
 * @see https://en.wikipedia.org/wiki/Race_condition
 */
export interface SyncOrganizer
{

    /**
     * send an action to the other object.
     * 
     * this will also call `onRecieve`.
     */
    send: (action: SyncAction) => void;

    /**
     * provide a callback function for when an action is recieved.
     */
    onRecieve: (callback: (action: SyncAction) => void) => void;

    /**
     * provide a function that will be called whenever a full sync is requested.
     * 
     * this data will be send to the other object,
     * and `onFullSync` will be called using this data.
     */
    getFullSyncData: (callback: () => unknown) => void;

    /**
     * provide a callback function for when a full sync is recieved.
     * 
     * data is retrieved using `getFullSyncData` from the other object.
     */
    onFullSync: (callback: (data: unknown) => void) => void;

    /**
     * call this to request a full synchronization.
     * 
     * this will result in the other object sending its data to this object,
     * after which the `onFullSync` callback will be called.
     * 
     * @warning any actions before the sync request could be discarded.
     * any actions after the sync request, but before the sync,
     * will be queued untile the synchronization is complete.
     */
    requestSync: () => void;
}
