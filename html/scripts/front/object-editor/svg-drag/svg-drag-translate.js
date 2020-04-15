import { TransformCommand } from "../../../core/transform-command";

const { ipcRenderer } = require("electron");

export function OnDragTranslateX()
{
    return {
        MouseUpdateCallback: function (x, y)
        {
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
            //return new TransformCommand("TRANSLATE", x, y).CreateMatrix();
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