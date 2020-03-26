const { dialog } = require("electron").remote;

const fileNameElement = document.getElementById("svg-file-name");

let currentFilePath = "";

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

OpenFile();

document.getElementById("svg-open-file-button").addEventListener("click", OpenFile);

