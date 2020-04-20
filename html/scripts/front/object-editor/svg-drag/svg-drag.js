import { OnDragTranslateX, OnDragTranslateY, OnDragTranslateCenter } from "./svg-drag-translate.js";
import { OnDragScaleX, OnDragScaleY, OnDragScaleCenter } from "./svg-drag-scale.js";

const functionMap = {
    OnDragTranslateX: OnDragTranslateX,
    OnDragTranslateY: OnDragTranslateY,
    OnDragTranslateCenter: OnDragTranslateCenter,

    OnDragScaleX: OnDragScaleX,
    OnDragScaleY: OnDragScaleY,
    OnDragScaleCenter: OnDragScaleCenter
};

export function GetCallbacks(name)
{
    return functionMap[name]();
}