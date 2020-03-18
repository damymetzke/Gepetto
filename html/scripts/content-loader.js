function LoadContent(file, target)
{
    let client = new XMLHttpRequest();
    client.open('GET', file);
    client.onload = function ()
    {
        let raw = client.response;
        let root = document.createElement("html");
        root.innerHTML = raw;

        let header = root.getElementsByTagName("head")[0];
        let body = root.getElementsByTagName("body")[0];

        target.innerHTML = body.innerHTML;
    };

    client.send();
}