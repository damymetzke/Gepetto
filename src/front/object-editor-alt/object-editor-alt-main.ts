import * as DropDown from "../global/dropdown.js";
import { SubDocHandler } from "../global/subdoc.js";

const { TransformCommand } = require("electron").remote.require("../core/core");

const eventListners = {
    OnChangeName: (event: KeyboardEvent) =>
    {

    },
    OnAddTransformCommand: (event: MouseEvent, template: any/*todo: change into transformcommand*/) =>
    {

    }
};

function SetupEventListners(root: SubDocHandler)
{
    root.GetElementBySid("property--name-input").addEventListener("keypress", eventListners.OnChangeName);
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