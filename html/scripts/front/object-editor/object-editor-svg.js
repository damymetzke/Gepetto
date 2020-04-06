import GetUniqueElements from "../global/get-unique-elements.js";

const { ipcRenderer } = require("electron");
const fs = require("fs");

function UpdateSvgData(element, data)
{
    if ("content" in data)
    {
        element.innerHTML = data.content;
    }
    if ("transform" in data)
    {
        const transformString = `matrix(${data.transform.matrix[0]} ${data.transform.matrix[1]} ${data.transform.matrix[2]} ${data.transform.matrix[3]} ${data.transform.matrix[4]} ${data.transform.matrix[5]} )`;
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

function SetupDragDisplays()
{
    elements.svg.innerHTML = fs.readFileSync("./resources/drag-icons.xml");
    dragDisplayElements = GetUniqueElements(elements.svg, {
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
    console.log("drag display elements:\n", dragDisplayElements);
}

//ipc renderer//
////////////////

function OnRefreshObjects(_event, data)
{
    if (!("selectedObject" in data))
    {
        return;
    }

    const object = data.selectedObject;

    if (!(object.name in svgObjects))
    {
        return;
    }

    const currentlySelected = elements.svg.getElementsByClassName("selected-svg-object");
    for (let i = 0; i < currentlySelected.length; ++i)
    {
        currentlySelected[i].classList.remove("selected-svg-object");
    }

    svgObjects[object.name].classList.add("selected-svg-object");
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
    elements.svg.appendChild(newElement);
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