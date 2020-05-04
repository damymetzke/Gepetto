const { dialog, getCurrentWindow } = require("electron").remote;
const { ipcRenderer } = require("electron");

const currentWindow = require('electron').remote.getCurrentWindow();


const fileNameElement = document.getElementById("svg-file-name");

let currentFilePath = null;

function OpenFile()
{
    dialog.showOpenDialog(
        currentWindow,
        {
            properties: ['openFile'],
            filters:
                [
                    { name: "Scalable Vector Graphics", extensions: ["svg", "xml"] },
                    { name: "All File Types", extensions: ["*"] }
                ]
        }).then(
            function (result)
            {
                if (result.filePaths.length > 0)
                {
                    currentFilePath = result.filePaths[0];
                    const splitFilePath = currentFilePath.split(/\/|\\/);
                    const fileName = splitFilePath[splitFilePath.length - 1];
                    fileNameElement.innerText = fileName;
                }
            },
            function (error)
            {
                console.warn("❌ Error during file dialog: ", error);
            });
}

function OnImport()
{
    const name = document.getElementById("name-field").value;
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
    ipcRenderer.invoke("import-svg",
        {
            name: name,
            filePath: currentFilePath
        }).then(function (result)
        {
            if (result.success)
            {
                ipcRenderer.invoke("select-object", {
                    selectLastObject: true
                });
                getCurrentWindow().close();
                return;
            }

            const convertedErrorMessage = result.message.replace("\n", "<br>");
            errorOutput.innerHTML += convertedErrorMessage;

        });
}

{
    OpenFile();


    document.getElementById("svg-open-file-button").addEventListener("click", OpenFile);
    document.getElementById("import-button").addEventListener("click", OnImport);
}


