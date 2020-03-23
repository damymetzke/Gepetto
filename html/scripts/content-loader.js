export class Content
{
    constructor(loadFunction, filePath)
    {
        if (typeof loadFunction !== "function" || typeof filePath !== "string")
        {
            console.error("Content constructor called with invalid types. Types expected are: 'function', 'string'");
            return;
        }

        this.OnLoad = loadFunction;
        this.file = filePath;
    }

    OnLoad(root)
    {
        console.error("Content:", this, "does not define OnLoad; called with root:", root);
    }
    file = "";
}

export function LoadContent(content, target)
{
    let client = new XMLHttpRequest();
    client.open('GET', content.file);
    client.onload = function ()
    {
        let raw = client.response;
        let root = document.createElement("html");
        root.innerHTML = raw;

        let header = root.getElementsByTagName("head")[0];
        let body = root.getElementsByTagName("body")[0];

        target.innerHTML = body.innerHTML;

        while (header.firstChild)
        {
            document.getElementsByTagName("head")[0].appendChild(header.firstChild);
        }
        content.OnLoad(target);
    };

    client.send();
}