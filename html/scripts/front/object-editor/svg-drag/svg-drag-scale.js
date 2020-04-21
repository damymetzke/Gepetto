const { ipcRenderer } = require("electron");

const { TransformCommand } = require("electron").remote.require("../core/core");

export function OnDragScaleX()
{
    return {
        MouseUpdateCallback: function (x, _y)
        {
            return new TransformCommand("SCALE", (x + 6) / 6, 1);
        },

        MouseUpCallback: function (x, _y)
        {
            ipcRenderer.invoke("update-transform-command", {
                relative: true, //this will add the values rather than override them
                fields: {
                    x: (x + 6) / 6
                }
            });
        }
    };
}

export function OnDragScaleY()
{
    return {
        MouseUpdateCallback: function (_x, y)
        {
            return new TransformCommand("SCALE", 1, (y + 6) / 6);
        },

        MouseUpCallback: function (_x, y)
        {
            ipcRenderer.invoke("update-transform-command", {
                relative: true, //this will add the values rather than override them
                fields: {
                    y: (y + 6) / 6
                }
            });
        }
    };
}

export function OnDragScaleCenter()
{
    return {
        MouseUpdateCallback: function (x, y)
        {
            return new TransformCommand("SCALE", (x + 6) / 6, (y + 6) / 6);
        },

        MouseUpCallback: function (x, y)
        {
            ipcRenderer.invoke("update-transform-command", {
                relative: true, //this will add the values rather than override them
                fields: {
                    x: (x + 6) / 6,
                    y: (y + 6) / 6
                }
            });
        }
    };
}