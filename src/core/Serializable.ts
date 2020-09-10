export type SerializeValue =
 | SerializeObject
 | SerializeArray
 | number
 | string
 | boolean
 | null;
export type SerializeObject = { [ key: string ]: SerializeValue; };
export type SerializeArray = SerializeValue[];

/**
 * used to serialize the extending object into a JSON-convertable format.
 * 
 * serialized objects are still in JS objects,
 * to use it as a string call `JSON.stringify(serialized)`,
 * and `JSON.parse(rawString)` to deserialize.
 */
export interface Serializable
{
    serialize(): SerializeObject;
    deserialize(serialized: SerializeObject): this;
    reset?(): void;
}
