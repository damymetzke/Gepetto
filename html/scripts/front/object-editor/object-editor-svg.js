import GetUniqueElements from "../global/get-unique-elements.js";

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

        {
            const resultVector = currentTransform.InnerMatrix().MultiplyVector([0, 1]);
            const length = Math.sqrt(resultVector[0] * resultVector[0] + resultVector[1] * resultVector[1]);
            const adaptedTransform = new TransformCommand("SCALE", 1 / length, 1 / length).CreateMatrix().MultiplyMatrix(currentTransform);

            console.log(length);

            const transformString = `matrix(${adaptedTransform.matrix[0]} ${adaptedTransform.matrix[1]} ${adaptedTransform.matrix[2]} ${adaptedTransform.matrix[3]} ${adaptedTransform.matrix[4]} ${adaptedTransform.matrix[5]})`;
            dragDisplayElements.root.setAttribute("transform", transformString);
        }

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

export function Init(root)
{
    SetupFileVariables(root);
    SetupDragDisplays();
    SetupIpcRenderer();
}