const { dialog } = require("electron").remote;

function OpenFile()
{
    dialog.showOpenDialog({ properties: ['openFile'] }).then(
        function (result)
        {
            console.log("success!", result.filePaths);
        },
        function (error)
        {
            console.warn("❌ Error during file dialog: ", error);
        });
}

//console.log(dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] }));
OpenFile();

const chooseFile = document.getElementById("svg-file");
console.log(chooseFile);

