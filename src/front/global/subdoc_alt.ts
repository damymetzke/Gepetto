const REGEX_SUBDOC_PATH = /\.subdoc\.html$/i;
const REGEX_SID_REPLACE = /<([^<>]*)sid="([a-z0-9_-]*)"([^<>]*)>/gi;

export class SubDoc
{
    ready: boolean;
    sidMap: { [ sid: string ]: HTMLElement | SVGElement; } = {};

    getElementBySid(sid: string): (HTMLElement | SVGElement)
    {
        if (!(sid in this.sidMap) || !this.ready)
        {
            return null;
        }

        return this.sidMap[ sid ];
    }

    constructor (sourcePath: string, root: HTMLElement, onready: () => void = () => { })
    {
        this.ready = false;
        if (!REGEX_SUBDOC_PATH.test(sourcePath))
        {
            console.error(`path '${sourcePath}' is not properly formatted for a subdoc document.\nexpected '*.subdoc.html'`);
        }

        let client = new XMLHttpRequest();
        client.open('GET', sourcePath);
        client.onload = () =>
        {
            let raw: string = client.response;
            let converted = raw.replace(REGEX_SID_REPLACE, (_match, before, sid, after) =>
            {
                return `<${before}data-generated-sid="${sid}"${after}>`;
            });

            root.innerHTML = converted;
            root.querySelectorAll("[data-generated-sid]").forEach((sidElement: HTMLElement | SVGElement) =>
            {
                this.sidMap[ sidElement.dataset.generatedSid ] = sidElement;
            });

            this.ready = true;
            onready();
        };

        client.send();
    }
}