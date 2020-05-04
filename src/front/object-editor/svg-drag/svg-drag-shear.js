const { ipcRenderer } = require("electron");

const { TransformCommand } = require("electron").remote.require("../core/core");

export function OnDragShear()
{
    return {
        MouseUpdateCallback: function (x, _y, selectedTransform)
        {
            return new TransformCommand("SHEARX", {
                x: x / 9
            });
        },

        MouseUpCallback: function (x, _y)
        {
            ipcRenderer.invoke("update-transform-command", {
                relative: true, //this will add the values rather than override them
                fields: {
                    x: x / 9
                }
            });
        }
    };
}