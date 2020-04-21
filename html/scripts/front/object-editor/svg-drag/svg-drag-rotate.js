const { ipcRenderer } = require("electron");

const { TransformCommand } = require("electron").remote.require("../core/core");

export function OnDragRotate()
{
    return {
        MouseUpdateCallback: function (x, y)
        {
            const angle = ((Math.atan2(y + 32, x)) / Math.PI * 180) - 90;

            return new TransformCommand("ROTATE", angle, 0);
        },

        MouseUpCallback: function (x, y)
        {
            const angle = ((Math.atan2(y + 32, x)) / Math.PI * 180) - 90;
            ipcRenderer.invoke("update-transform-command", {
                relative: true, //this will add the values rather than override them
                fields: {
                    x: angle
                }
            });
        }
    };
}