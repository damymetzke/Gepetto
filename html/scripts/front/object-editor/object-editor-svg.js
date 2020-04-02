import GetUniqueElements from "../global/get-unique-elements.js";

const { ipcRenderer } = require("electron");

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

//ipc renderer//
////////////////

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

function OnAddSvgObject(_event, data)
{
    console.log(data);
    if (!("name" in data) || !("data" in data))
    {
        return;
    }

    let newElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
    elements.svg.appendChild(newElement);
    svgObjects[data.name] = newElement;

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
    ipcRenderer.on("add-svg-object", OnAddSvgObject);
    ipcRenderer.on("update-svg-object", OnUpdateSvgObject);
    ipcRenderer.on("remove-svg-object", OnRemoveSvgObject);
}

export function Init(root)
{
    SetupFileVariables(root);
    SetupIpcRenderer();
}