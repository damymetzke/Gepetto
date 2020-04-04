export function ipcCallback(event, object)
{
    if (!("ipcCallback" in object))
    {
        return;
    }

    event.sender.invoke(object.ipcCallback);
}