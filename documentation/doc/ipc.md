# IPC
Electron makes use of 2 types of processes: *main and render*. There is only 1 main process, and every window has its own render process. In order to communicate between these processes ipc, or inter-process communication, is used. This document will set the guidelines for ipc between the render processes and the main process.

## Front and back
The relation between the render process and the main process is comparable to front- and back-end in a website. However there is 1 big difference: in electron communication between the front and back do not use the internet. This makes the cost of sending data cheaper than in web development, which leads to the following design decision:

The front of the application has 3 things it should be able to do:

- Update display based on data recieved from the back.
- Directly send actions to the back.
- Handle anything that the back doesn't need to know about itself (e.g. drag and drop for a tabbing system).

Rather than updating the display directly the logic first flows through the back of the application. This helps creating a clear logical structure, avoids data duplication, and is more resistant to bugs at the cost of a little performance. There is, however, an exception: whenever something is updated too regularly (e.g. if the mouse mosition is followed every movement, or there is a big text box), it is better to queue any changes and send everything to the back at once (usually whenever the user un-focusses, stops dragging, etc.).

## Element event ipc
Most casesof using the ipc from the front to the back looks like this:

1. create an element with all information needed to send an update.
2. wait for a specific event.
3. send data directly to the back with as little processing as possible.

data can either be stored in the element itself, or as part of the event call. For example:
```js
    function OnElementClicked(element, id)
    {
        ipcMain.invoke("channel", {
            input: element.value,
            name: element.dataset.name,
            id: id
        });
    }

    function CreateSomeElement(element)
    {
        const id = SomeFunctionToGetAnId();
        element.addEventListner("click", function()
        {
            OnElementClicked(element, id);
        });
    }
```

## Top object is always data
"Top object is always 'data'", this is a phrase capturing the next rule. It basically means that you should always name the root object 'data', and that this should make sense. For example: if you need to pass a single value rather than passing only that you wrap it in an object like such:
```js
    let data = {
        count: 1
    }
```
This is done to support any future changes. Recieving functions generally test each possible key and do something if it exists.