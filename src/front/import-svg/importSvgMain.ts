const { dialog, getCurrentWindow } = require("electron").remote;
const { ipcRenderer } = require("electron");

const currentWindow = require('electron').remote.getCurrentWindow();

const { xml2js, js2xml } = require("xml-js");
const _ = require("lodash");

const REGEX_VIEW_BOX = /(?:\s|,)+/g;

const fileNameElement = document.getElementById("svg-file-name");
const listElement = document.getElementById("list");

let currentFilePath = null;
let numSelected: number = 0;
let checkBoxList: HTMLInputElement[] = [];

class GTreeNode
{
    gElement: SVGGElement;
    checkBox: HTMLInputElement;
    listItemContent: HTMLElement;

    parent: GTreeNode;
    children: GTreeNode[];

    constructor (gElement: SVGGElement, checkBox: HTMLInputElement, listItemContent: HTMLElement, parent: GTreeNode)
    {
        this.gElement = gElement;
        this.checkBox = checkBox;
        this.listItemContent = listItemContent;

        this.parent = parent;
        this.children = [];
    }

    addChild(gElement: SVGGElement, checkBox: HTMLInputElement, listItemContent: HTMLElement): GTreeNode
    {
        const result = new GTreeNode(gElement, checkBox, listItemContent, this);
        this.children.push(result);
        return result;
    }

    getSelfAndDescendants(): GTreeNode[]
    {
        return [
            this,
            ...(_.flatten(
                this.children
                    .map(child => child.getSelfAndDescendants())
            ))
        ];
    }

    getSelfAndAncestors(): GTreeNode[]
    {
        return [
            this,
            ...(this.parent === null
                ? []
                : this.parent.getSelfAndAncestors())
        ];
    }

    setupLogic()
    {
        const descendants: GTreeNode[] = _.flatten(
            this.children
                .map(child => child.getSelfAndDescendants())
        );
        const ancestors =
            this.parent === null
                ? []
                : this.parent.getSelfAndAncestors();

        const ancestorsAndDescendants = [
            ...descendants,
            ...ancestors
        ];

        const allConnected = [
            ...ancestorsAndDescendants,
            this
        ];

        this.checkBox.addEventListener("input", () => onCheckbox(
            allConnected.map(value => value.gElement),
            this.checkBox,
            ancestorsAndDescendants.map(value => value.checkBox)
        ));

        this.children.forEach(child => child.setupLogic());

        this.listItemContent.addEventListener("mouseenter", () =>
        {
            allConnected
                .map(focusElement => focusElement.gElement)
                .forEach(focusElement => focusElement.classList.add("focussed"));
            listElement.classList.add("any-hovered");
        });
        this.listItemContent.addEventListener("mouseleave", () =>
        {
            allConnected
                .map(focusElement => focusElement.gElement)
                .forEach(focusElement => focusElement.classList.remove("focussed"));
            listElement.classList.remove("any-hovered");
        });
    }

}

function buildGTree(element: SVGGElement, gTreeIndex: string, list: HTMLOListElement, node: GTreeNode): void
{
    list.innerHTML = "";

    Array.from(element.children)
        .filter(child => child.tagName === "g")
        .forEach((child: SVGGElement, index: number) =>
        {
            //setup child
            /////////////
            const nextGTreeIndex = `${gTreeIndex}.${String(index)}`;

            child.classList.add("g-tree-element");
            child.dataset.index = nextGTreeIndex;

            //setup list item
            /////////////////
            const listEntry = document.createElement("li");
            listEntry.innerHTML = getListEntry();
            list.appendChild(listEntry);

            const [ pElement, subListElement ] = <[ HTMLElement, HTMLOListElement ]>Array.from(listEntry.children);
            const [ checkBox ] = <[ HTMLInputElement ]>Array.from(pElement.children);

            checkBox.dataset.gTreeIndex = nextGTreeIndex;

            const next = node.addChild(child, checkBox, pElement);
            buildGTree(child, nextGTreeIndex, subListElement, next);
        });

}

function getListEntry()
{
    const text = "&LeftAngleBracket;g&RightAngleBracket;";
    return `
        <p>
        <input type="checkbox">
        ${text}
        </p>
        <ol>
        </ol>
    `;
}

function onCheckbox(elements: SVGGElement[], checkBox: HTMLInputElement, toDisable: HTMLInputElement[])
{
    elements.forEach(selectElement =>
    {
        const previous = selectElement.dataset.numSelected
            ? parseInt(selectElement.dataset.numSelected)
            : 0;

        const next = checkBox.checked
            ? previous + 1
            : previous - 1;

        selectElement.dataset.numSelected = String(next);
        if (next === 0)
        {
            selectElement.classList.remove("selected");
        }
        else
        {
            selectElement.classList.add("selected");
        }
    });

    toDisable.forEach(selectElement =>
    {
        const previous = selectElement.dataset.numSelected
            ? parseInt(selectElement.dataset.numSelected)
            : 0;

        const next = checkBox.checked
            ? previous + 1
            : previous - 1;

        selectElement.dataset.numSelected = String(next);
        if (next === 0)
        {
            selectElement.disabled = false;
        }
        else
        {
            selectElement.disabled = true;
        }
    });

    numSelected += checkBox.checked
        ? 1
        : -1;

    if (numSelected === 0)
    {
        listElement.classList.remove("any-selected");
    }
    else
    {
        listElement.classList.add("any-selected");
    }
}

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
                //setup child
                /////////////
                const nextGTreeIndex = String(index);

                child.classList.add("g-tree-element");
                child.dataset.index = nextGTreeIndex;

                //setup list item
                /////////////////
                const listEntry = document.createElement("li");
                listEntry.innerHTML = getListEntry();

                document.getElementById("list--root").appendChild(listEntry);

                const [ pElement, subListElement ] = <[ HTMLElement, HTMLOListElement ]>Array.from(listEntry.children);
                const [ checkBox ] = <[ HTMLInputElement ]>Array.from(pElement.children);

                checkBox.dataset.gTreeIndex = nextGTreeIndex;

                const next = new GTreeNode(child, checkBox, pElement, null);
                buildGTree(child, nextGTreeIndex, subListElement, next);
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