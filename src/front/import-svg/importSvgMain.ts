const { dialog, getCurrentWindow } = require("electron").remote;
const { ipcRenderer } = require("electron");

const currentWindow = require('electron').remote.getCurrentWindow();

const { xml2js, js2xml } = require("xml-js");

const REGEX_VIEW_BOX = /(?:\s|,)+/g;

const fileNameElement = document.getElementById("svg-file-name");

let currentFilePath = null;

function getGTree(element: SVGGElement | SVGSVGElement, gTreeIndex: string, list: HTMLOListElement, parents: SVGGElement[]): any
{
    list.innerHTML = "";
    return Array.from(element.children)
        .filter(child => child.tagName === "g")
        .map((child: SVGGElement, index: number) =>
        {
            child.classList.add("g-tree-element");
            const newGTreeIndex = gTreeIndex
                ? `${gTreeIndex}.${String(index)}`
                : String(index);
            child.dataset.index = newGTreeIndex;

            const listEntry = document.createElement("li");
            listEntry.innerHTML =
                `
                    <p>
                    <input type="checkbox">
                    &LeftAngleBracket;g&RightAngleBracket;
                    </p>
                    <ol>
                    </ol>
                `;
            const [ pElement, subListElement ] = <[ HTMLElement, HTMLOListElement ]>Array.from(listEntry.children);
            const [ checkBox ] = Array.from(pElement.children);

            const childResults = getGTree(child, newGTreeIndex, subListElement, [ ...parents, child ]);
            const allElements: SVGGElement[] = [ ...(childResults.reduce((total, current) => [ ...total, ...current.allElements ], [])), child ];

            pElement.addEventListener("mouseenter", () =>
            {
                [ ...allElements, ...parents ].forEach(focusElement => focusElement.classList.add("focussed"));
            });
            pElement.addEventListener("mouseleave", () =>
            {
                allElements.forEach(focusElement => focusElement.classList.remove("focussed"));
            });

            list.appendChild(listEntry);

            return {
                element: child,
                allElements: allElements,
                children: childResults
            };
        });
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

            //preview svg
            (async () =>
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

                console.log(getGTree(svgElement, "", <HTMLOListElement>document.getElementById("list--root"), []));
            })();
        }
    }
    catch (error)
    {
        console.warn("❌ Error during file dialog: ", error);
    }
}

async function onImport()
{
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
            filePath: currentFilePath
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

console.log("😊");