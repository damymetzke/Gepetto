const { ipcMain } = require("electron");

function Init()
{
    ipcMain.handle("import-svg", function (event, arguments)
    {
        return {
            success: true
        };
    });
}

module.exports.Init = Init;