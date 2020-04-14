import { OnDragTranslateX, OnDragTranslateY, OnDragTranslateCenter } from "./svg-drag-translate.js";

const functionMap = {
    OnDragTranslateX: OnDragTranslateX,
    OnDragTranslateY: OnDragTranslateY,
    OnDragTranslateCenter: OnDragTranslateCenter
};

export function GetCallbacks(name)
{
    return functionMap[name]();
}