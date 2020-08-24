const { dialog, getCurrentWindow } = require("electron").remote;
const { ipcRenderer } = require("electron");

const currentWindow = require('electron').remote.getCurrentWindow();


const fileNameElement = document.getElementById("svg-file-name");

let currentFilePath = null;

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

openFile();


document.getElementById("svg-open-file-button").addEventListener("click", openFile);
document.getElementById("import-button").addEventListener("click", onImport);
document.getElementById("sub-object-button").addEventListener("click", onSubObject);

console.log("😊");