import * as DropDown from "../global/dropdown.js";
import { SubDocHandler } from "../global/subdoc.js";

const { TransformCommand } = require("electron").remote.require("../core/core");

const { ipcRenderer } = require("electron");

interface IpcUpdateObject
{
    name: string;
}

interface IpcAddTransformCommand
{
    command: {};
}


const eventListners = {
    OnChangeName: (event: KeyboardEvent, root: SubDocHandler) =>
    {
        if (event.key !== "Enter")
        {
            return;
        }

        ipcRenderer.invoke("update-object", <IpcUpdateObject>{
            name: (<HTMLInputElement>root.GetElementBySid("property--name-input")).value
        });
    },
    OnAddTransformCommand: (event: MouseEvent, template: any/*todo: change into transformcommand*/) =>
    {
        ipcRenderer.invoke("add-transform-command-alt", <IpcAddTransformCommand>{
            command: template.ToPureObject()
        });
    }
};

function SetupEventListners(root: SubDocHandler)
{
    root.GetElementBySid("property--name-input").addEventListener("keypress", (event: KeyboardEvent) => { eventListners.OnChangeName(event, root); });
    Array.from(root.GetElementBySid("property--transform-add-controls").children).forEach((child: HTMLElement | SVGElement) =>
    {
        const type = child.dataset.transformCommandType;
        child.addEventListener("click", (event: MouseEvent) => { eventListners.OnAddTransformCommand(event, new TransformCommand(type)); });
    });
}

export function Init(root: SubDocHandler)
{
    DropDown.OnScriptLoad(root);

    SetupEventListners(root);
}