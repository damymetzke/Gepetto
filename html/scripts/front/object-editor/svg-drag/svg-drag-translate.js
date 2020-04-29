const { ipcRenderer } = require("electron");

const { TransformCommand } = require("electron").remote.require("../core/core");

export function OnDragTranslateX()
{
    return {
        MouseUpdateCallback: function (x, _y, selectedTransform)
        {
            return new TransformCommand("TRANSLATE", {
                x: x
            });
        },

        MouseUpCallback: function (x, y)
        {
            ipcRenderer.invoke("update-transform-command", {
                relative: true, //this will add the values rather than override them
                fields: {
                    x: x
                }
            });
        }
    };
}

export function OnDragTranslateY()
{
    return {
        MouseUpdateCallback: function (_x, y, selectedTransform)
        {
            return new TransformCommand("TRANSLATE", {
                y: y
            });
        },

        MouseUpCallback: function (x, y)
        {
            ipcRenderer.invoke("update-transform-command", {
                relative: true, //this will add the values rather than override them
                fields: {
                    y: y
                }
            });
        }
    };
}

export function OnDragTranslateCenter()
{
    return {
        MouseUpdateCallback: function (x, y, selectedTransform)
        {
            return new TransformCommand("TRANSLATE", {
                x: x,
                y: y
            });
        },

        MouseUpCallback: function (x, y)
        {
            ipcRenderer.invoke("update-transform-command", {
                relative: true, //this will add the values rather than override them
                fields: {
                    x: x,
                    y: y
                }
            });
        }
    };
}