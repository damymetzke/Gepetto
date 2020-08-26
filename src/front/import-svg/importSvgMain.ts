import { GTreeNode, getListEntry, buildGTree, buildGTreeNode } from "./gTree.js";

const { dialog, getCurrentWindow } = require("electron").remote;
const { ipcRenderer } = require("electron");

const currentWindow = require('electron').remote.getCurrentWindow();

const { xml2js, js2xml } = require("xml-js");
const _ = require("lodash");

const fileNameElement = document.getElementById("svg-file-name");

let currentFilePath = null;
let checkBoxList: HTMLInputElement[] = [];

async function previewSvg()
{
    const svgRequest = new window.XMLHttpRequest();
    svgRequest.open("GET", currentFilePath);
    await new Promise(resolve =>
    {
        svgRequest.onload = () =>
        {
            resolve();
        };

        svgRequest.send();
    });

    const jsonSvg = xml2js(svgRequest.response);
    const [ rootElement ] = jsonSvg.elements.filter(element => element.type === "element" && element.name === "svg");

    if (!("attributes" in rootElement) || !("viewBox" in rootElement.attributes))
    {
        return;
    }
    const viewBox = rootElement.attributes.viewBox;

    const svgElement = <SVGSVGElement><HTMLOrSVGElement>document.getElementById("viewport--svg");
    svgElement.setAttribute("viewBox", viewBox);

    const previewResult = {
        elements: rootElement.elements
    };

    const previewText = js2xml(previewResult);
    svgElement.innerHTML = previewText;

    document.getElementById("list--root").innerHTML = "";
    checkBoxList = _.flatten(
        Array.from(svgElement.children)
            .filter(child => child.tagName === "g")
            .map((child: SVGGElement, index) =>
            {
                const next = buildGTreeNode(
                    child,
                    String(index),
                    <HTMLOListElement>document.getElementById("list--root")
                );

                next.setupLogic();
                return next.getSelfAndDescendants().map(value => value.checkBox);
            })
    );

    console.log(checkBoxList);
}

async function openFile()
{
    try
    {
        const dialogResult = await dialog.showOpenDialog(
            currentWindow,
            {
                properties: [ 'openFile' ],
                filters:
                    [
                        { name: "Scalable Vector Graphics", extensions: [ "svg", "xml" ] },
                        { name: "All File Types", extensions: [ "*" ] }
                    ]
            });

        if (dialogResult.filePaths.length > 0)
        {
            currentFilePath = dialogResult.filePaths[ 0 ];
            const splitFilePath = currentFilePath.split(/\/|\\/);
            const fileName = splitFilePath[ splitFilePath.length - 1 ];
            fileNameElement.innerText = fileName;

            previewSvg();
        }
    }
    catch (error)
    {
        console.warn("❌ Error during file dialog: ", error);
    }
}

async function onImport()
{
    const subObjects = checkBoxList
        .filter(checkBox => checkBox.checked)
        .map(checkBox => checkBox.dataset.gTreeIndex);

    const name = (<HTMLInputElement>document.getElementById("name-field")).value;
    let errorOutput = document.getElementById("error-output");
    errorOutput.innerHTML = "";

    let invalidInput = false;
    if (currentFilePath === null)
    {
        errorOutput.innerHTML += "Please select a file.<br>";
        invalidInput = true;
    }
    if (name === "")
    {
        errorOutput.innerHTML += "Please enter a name.<br>";
        invalidInput = true;
    }

    if (invalidInput)
    {
        return;
    }

    console.log(require("electron"));
    const ipcResult = await ipcRenderer.invoke("import-svg",
        {
            name: name,
            filePath: currentFilePath,
            subObjects: subObjects
        });

    if (!ipcResult.success)
    {
        const convertedErrorMessage = ipcResult.message.replace("\n", "<br>");
        errorOutput.innerHTML += convertedErrorMessage;
        return;
    }

    ipcRenderer.invoke("select-object", {
        selectLastObject: true
    });
    getCurrentWindow().close();

}

function onSubObject()
{
    currentWindow.setBounds({
        width: 900,
        height: 600
    });
}

//execution starts here
openFile();


document.getElementById("svg-open-file-button").addEventListener("click", openFile);
document.getElementById("import-button").addEventListener("click", onImport);
document.getElementById("sub-object-button").addEventListener("click", onSubObject);