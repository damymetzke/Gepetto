import GetUniqueElements from "../global/get-unique-elements.js";
import { GetCallbacks } from "./svg-drag/svg-drag.js";
import common from "./object-editor-common.js";

const { ipcRenderer } = require("electron");
const { Transform, DrawObject, TransformCommand } = require("electron").remote.require("../core/core");
const fs = require("fs");

function UpdateSvgData(element, data)
{
    if ("content" in data)
    {
        element.innerHTML = data.content;
    }
    if ("transform" in data)
    {
        const transformString = `matrix(${data.transform.matrix[0]} ${data.transform.matrix[1]} ${data.transform.matrix[2]} ${data.transform.matrix[3]} ${data.transform.matrix[4]} ${data.transform.matrix[5]})`;
        element.setAttribute("transform", transformString);
    }
}

//file variables//
//////////////////
let elements = null;
let svgObjects = {};

function SetupFileVariables(root)
{
    elements = GetUniqueElements(root, {
        svg: "object-editor--main--svg"
    });
}

//drag displays//
/////////////////

let dragDisplayElements = null;
let currentTransformCommandIndex = -1;
let currentTransformCommands = null;
let currentTransform = new Transform();

function SetupDragDisplays()
{
    elements.svg.innerHTML = fs.readFileSync("./resources/drag-icons.xml");
    dragDisplayElements = GetUniqueElements(elements.svg, {
        root: "drag-display",

        translate: "drag-display--translate",
        translateX: "drag-display--translate--x",
        translateY: "drag-display--translate--y",
        translateCenter: "drag-display--translate--center",

        scale: "drag-display--scale",
        scaleX: "drag-display--scale--x",
        scaleY: "drag-display--scale--y",
        scaleCenter: "drag-display--scale--center",

        rotate: "drag-display--rotate",
        rotateCircle: "drag-display--rotate--circle",
        rotateCenter: "drag-display--rotate--center",

        shear: "drag-display--shear",
        shearTriangle: "drag-display--shear--triangle",
        shearCenter: "drag-display--shear--center"
    });
}

function MoveDragDisplay(transform, sizeX = 1, sizeY = 1)
{
    const resultVectorX = transform.InnerMatrix().MultiplyVector([sizeX, 0]);
    const resultVectorY = transform.InnerMatrix().MultiplyVector([0, sizeY]);
    const lengthX = Math.sqrt(resultVectorX[0] * resultVectorX[0] + resultVectorX[1] * resultVectorX[1]);
    const lengthY = Math.sqrt(resultVectorY[0] * resultVectorY[0] + resultVectorY[1] * resultVectorY[1]);
    const adaptedTransform = new TransformCommand("SCALE", { x: 1 / lengthX, y: 1 / lengthY }).CreateMatrix().MultiplyMatrix(transform);

    const transformString = `matrix(${adaptedTransform.matrix[0]} ${adaptedTransform.matrix[1]} ${adaptedTransform.matrix[2]} ${adaptedTransform.matrix[3]} ${adaptedTransform.matrix[4]} ${adaptedTransform.matrix[5]})`;
    dragDisplayElements.root.setAttribute("transform", transformString);
}

//ipc renderer//
////////////////

function OnRefreshObjects(_event, data)
{
    if ("selectedObject" in data)
    {
        let object = new DrawObject();
        object.FromPureObject(data.selectedObject);
        currentTransformCommands = object.transformCommands;
        currentTransform = object.WorldTransform();


        if (!(object.name in svgObjects))
        {
            return;
        }

        MoveDragDisplay(currentTransform);

        const currentlySelected = elements.svg.getElementsByClassName("selected-svg-object");
        for (let i = 0; i < currentlySelected.length; ++i)
        {
            currentlySelected[i].classList.remove("selected-svg-object");
        }

        svgObjects[object.name].classList.add("selected-svg-object");
    }

    if ("transformCommandIndex" in data)
    {
        currentTransformCommandIndex = data.transformCommandIndex;
    }

    elements.svg.classList.remove("drag-display-active--translate");
    elements.svg.classList.remove("drag-display-active--scale");
    elements.svg.classList.remove("drag-display-active--rotate");
    elements.svg.classList.remove("drag-display-active--shear");

    if (currentTransformCommandIndex === -1)
    {
        return;
    }

    switch (currentTransformCommands[currentTransformCommandIndex].type)
    {
        case "TRANSLATE":
            elements.svg.classList.add("drag-display-active--translate");
            break;
        case "SCALE":
            elements.svg.classList.add("drag-display-active--scale");
            break;
        case "ROTATE":
            elements.svg.classList.add("drag-display-active--rotate");
            break;
        case "SHEARX":
        case "SHEARY":
            elements.svg.classList.add("drag-display-active--shear");
    }



}

function OnAddSvgObject(_event, data)
{
    if (!("name" in data) || !("data" in data))
    {
        return;
    }

    const name = data.name;

    let newElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
    newElement.addEventListener("click", function ()
    {
        OnSelectObject(name);
    });
    elements.svg.insertBefore(newElement, elements.svg.firstChild);
    svgObjects[name] = newElement;

    UpdateSvgData(newElement, data.data);
}

function OnUpdateSvgObject(_event, data)
{
    if (!("name" in data) || !("data" in data))
    {
        return;
    }

    if (!(data.name in svgObjects))
    {
        return;
    }

    UpdateSvgData(svgObjects[data.name], data.data);
}

function OnRemoveSvgObject(_event, data)
{
    if (!("name" in data))
    {
        return;
    }
}

function SetupIpcRenderer()
{
    ipcRenderer.on("refresh-objects", OnRefreshObjects);
    ipcRenderer.on("add-svg-object", OnAddSvgObject);
    ipcRenderer.on("update-svg-object", OnUpdateSvgObject);
    ipcRenderer.on("remove-svg-object", OnRemoveSvgObject);
}

//event listners//
//////////////////

function OnSelectObject(objectName)
{
    ipcRenderer.invoke("select-object", objectName);
}

//drag and drop//
/////////////////

let MouseUpCallback = null;
let MouseUpdateCallback = null;
let dragDropStartPosition = [0, 0];
let currentSvgPosition = [0, 0];
let ghostElement = null;
let ghostTransformCommands = new DrawObject();
let ghostChangingTransformCommand = null;
let ghostBaseTransform = null;

//translate//
function OnDragStart(name)
{
    let callbacks = GetCallbacks(name);
    MouseUpCallback = callbacks.MouseUpCallback;
    MouseUpdateCallback = callbacks.MouseUpdateCallback;
    dragDropStartPosition = currentSvgPosition;
    ipcRenderer.invoke("retrieve-ghost", {}).then(function (ghost)
    {
        ghostElement = svgObjects[ghost.name].cloneNode(true);
        elements.svg.insertBefore(ghostElement, elements.svg.lastChild);
        ghostTransformCommands.FromPureObject(ghost.transformCommands);
        ghostChangingTransformCommand = ghostTransformCommands.transformCommands[ghost.transformCommandIndex];
        ghostBaseTransform = ghostChangingTransformCommand.fields;
        console.log(ghostBaseTransform);
    });
}

function GetOnDragStart(name)
{
    return function (_mouseEvent)
    {
        OnDragStart(name);
    };
}

function SetupDragAndDrop()
{
    //update and mouseUp
    elements.svg.addEventListener("mousemove", function (mouseEvent)
    {
        const x = (mouseEvent.offsetX / elements.svg.clientWidth * 200) - 100;
        const y = (mouseEvent.offsetY / elements.svg.clientHeight * 200) - 100;
        currentSvgPosition = [x, y];

        if (MouseUpdateCallback === null)
        {
            return;
        }

        const relativeX = x - dragDropStartPosition[0];
        const relativeY = y - dragDropStartPosition[1];

        const relativeTransformCommand = MouseUpdateCallback(relativeX, relativeY);
        const relativeTransform = relativeTransformCommand.CreateMatrix();

        console.log("🐳", relativeTransformCommand);

        const vectorX = relativeTransform.InnerMatrix().MultiplyVector([1, 0]);
        const vectorY = relativeTransform.InnerMatrix().MultiplyVector([0, 1]);

        const lengthX = Math.sqrt(vectorX[0] * vectorX[0] + vectorX[1] * vectorX[1]);
        const lengthY = Math.sqrt(vectorY[0] * vectorY[0] + vectorY[1] * vectorY[1]);

        const resultingTransform = relativeTransform === undefined || relativeTransform === null ?
            currentTransform :
            relativeTransform.MultiplyMatrix(currentTransform);

        MoveDragDisplay(resultingTransform, 1 / lengthX, 1 / lengthY);

        let dragDisplayObject = common.activeDrawObject.Clone();
        dragDisplayObject.transformCommands[common.transformCommandIndex].AddRelative(relativeTransformCommand);
        dragDisplayObject.OnTransformCommandsUpdate();
        //MoveDragDisplay(dragDisplayObject.relativeTransform);
    });

    document.onmouseup = function (mouseEvent)
    {
        if (MouseUpCallback !== null)
        {
            const relativeX = currentSvgPosition[0] - dragDropStartPosition[0];
            const relativeY = currentSvgPosition[1] - dragDropStartPosition[1];
            MouseUpCallback(relativeX, relativeY);

            console.log(relativeX, relativeY);

        }

        MouseUpCallback = null;
        MouseUpdateCallback = null;
        if (ghostElement)
        {
            elements.svg.removeChild(ghostElement);
            ghostElement = null;
        }
    };

    //translate
    dragDisplayElements.translateX.addEventListener("mousedown", GetOnDragStart("OnDragTranslateX"));
    dragDisplayElements.translateY.addEventListener("mousedown", GetOnDragStart("OnDragTranslateY"));
    dragDisplayElements.translateCenter.addEventListener("mousedown", GetOnDragStart("OnDragTranslateCenter"));

    //scale
    dragDisplayElements.scaleX.addEventListener("mousedown", GetOnDragStart("OnDragScaleX"));
    dragDisplayElements.scaleY.addEventListener("mousedown", GetOnDragStart("OnDragScaleY"));
    dragDisplayElements.scaleCenter.addEventListener("mousedown", GetOnDragStart("OnDragScaleCenter"));

    //rotate
    dragDisplayElements.rotateCircle.addEventListener("mousedown", GetOnDragStart("OnDragRotate"));

    //shear
    dragDisplayElements.shearTriangle.addEventListener("mousedown", GetOnDragStart("OnDragShear"));
}

export function Init(root)
{
    SetupFileVariables(root);
    SetupDragDisplays();
    SetupIpcRenderer();
    SetupDragAndDrop();
}