let window = null;

let svgObjects = new Set();

function AddSvgObject(name, content)
{
    if (svgObjects.has(name))
    {
        return;
    }

    svgObjects.add(name);

    window.webContents.send("add-svg-object", {
        name: name,
        content: content
    });
}

function UpdateSvgTransform(name, transform)
{
    if (!svgObjects.has(name))
    {
        return;
    }

    window.webContents.send("update-svg-transform", {
        name: name,
        transform: transform
    });
}

function RemoveSvgObject(name)
{
    if (!svgObjects.has(name))
    {
        return;
    }

    svgObjects.delete(name);

    window.webContents.send("remove-svg-content", {
        name: name
    });
}