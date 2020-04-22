const { ipcRenderer } = require("electron");

const { TransformCommand } = require("electron").remote.require("../core/core");

export function OnDragTranslateX()
{
    return {
        MouseUpdateCallback: function (x, y)
        {
            return new TransformCommand("TRANSLATE", x, 0);
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
        MouseUpdateCallback: function (x, y)
        {
            return new TransformCommand("TRANSLATE", 0, y);
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
        MouseUpdateCallback: function (x, y)
        {
            return new TransformCommand("TRANSLATE", x, y);
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