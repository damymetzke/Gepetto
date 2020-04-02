const { Transform } = require("../core/core");

let window = null;
let svgObjects = new Set();

/**
 * add a new object to the svg panel.
 * 
 * if the object already exists nothing will happen.
 * to update an existing object use {@link module:SvgManager~UpdateSvgObject}.
 * 
 * @param {String} name unique name of the svg object, the same as the draw object.
 * @param {Object} data object containing the data of the svg object.
 * object uses the following values:
 * ```js
 * {
 *     content: String(), //svg-xml formatted string, this will be directly added to a <g> tag
 *     transform: new Transform() //(optional) the transform of the object
 * }
 * ```
 */
function AddSvgObject(name, data)
{
    if (svgObjects.has(name))
    {
        return;
    }

    if (!("content" in data))
    {
        return;
    }

    svgObjects.add(name);

    window.webContents.send("add-svg-object", {
        name: name,
        data: data
    });
}

/**
 * update an existing object in the svg panel.
 * 
 * if the object does not exist nothing will happen.
 * to add a new object use {@link module:SvgManager~AddSvgObject}.
 * 
 * @param {String} name unique name of the svg object, the same as the draw object.
 * @param {Object} data object containing the data of the svg object.
 * object can use the following values, but all are optional:
 * ```js
 * {
 *     content: String(), //svg-xml formatted string, this will be directly added to a <g> tag
 *     transform: new Transform() //the transform of the object
 * }
 * ```
 */
function UpdateSvgObject(name, data)
{
    console.log(name, data);
    if (!svgObjects.has(name))
    {
        return;
    }

    window.webContents.send("update-svg-transform", {
        name: name,
        data: data
    });
}

/**
 * Remove an existing object in the svg panel.
 * 
 * if the object exists remove it from the svg panel.
 * 
 * @param {String} name unique name of the svg object, the same as the draw object.
 */
function RemoveSvgObject(name)
{
    if (!svgObjects.has(name))
    {
        return;
    }

    svgObjects.delete(name);

    window.webContents.send("remove-svg-content", {
        name: name
    });
}

/**
 * initialize this module.
 * 
 * should be called when this module is loaded.
 * 
 * @param {BrowserWindow} windowValue the main window.
 * this will be used to pass on events.
 */
function Init(windowValue)
{
    window = windowValue;
}

/**
 * @alias module:SvgManager.AddSvgObject
 */
module.exports.AddSvgObject = AddSvgObject;
/**
 * @alias module:SvgManager.UpdateSvgObject
 */
module.exports.UpdateSvgObject = UpdateSvgObject;
/**
 * @alias module:SvgManager.RemoveSvgObject
 */
module.exports.RemoveSvgObject = RemoveSvgObject;

module.exports.Init = Init;

/**
 * will manage the svg side of the draw objects.
 *
 * @module SvgManager
 */