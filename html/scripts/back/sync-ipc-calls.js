const { ipcMain } = require("electron");


callMultipleIpc(window, calls);
{
    function CallMultipleIpcImplementation(index)
    {
        if (index >= calls.length)
        {
            return;
        }

        const channelString = "ipc-callback--" + String(index);
        ipcMain.handle(channelString, function (_event, _data)
        {
            ipcMain.removeHandler(channelString);
            CallMultipleIpcImplementation(index + 1);
        });
        window.webContents.send(calls[index].channel, Object.assign({ ipcCallback: channelString }, calls[index].data));
    }

    CallMultipleIpcImplementation(0);
}