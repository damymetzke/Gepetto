const { dialog, getCurrentWindow } = require("electron").remote;
const { ipcRenderer } = require("electron");

const fileNameElement = document.getElementById("svg-file-name");

let currentFilePath = null;

function OpenFile()
{
    dialog.showOpenDialog({ properties: ['openFile'] }).then(
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
    ipcRenderer.invoke("import-svg", [name, currentFilePath]).then(function (result)
    {
        if (result.success)
        {
            getCurrentWindow().close();
            return;
        }

        errorOutput.innerHTML += result.message;
    });
}

{
    OpenFile();


    document.getElementById("svg-open-file-button").addEventListener("click", OpenFile);
    document.getElementById("import-button").addEventListener("click", OnImport);
}


