const REGEX_SUBDOC_PATH = /\.subdoc\.html$/iu;
const REGEX_SID_REPLACE = /<([^<>]*)sid="([a-z0-9_-]*)"([^<>]*)>/giu;

export class SubDoc {

    ready: boolean;

    sidMap: { [ sid: string ]: HTMLElement | SVGElement; } = {};

    root: HTMLElement | SVGElement;

    onReady: (() => void)[];

    destroy (destroyRoot = false): void {

        this.ready = false;
        this.sidMap = {};
        destroyRoot
            ? this.root.parentElement.removeChild(this.root)
            : this.root.innerHTML = "";

    }

    getElementBySid (sid: string): (HTMLElement | SVGElement) {

        if (!(sid in this.sidMap) || !this.ready) {

            return null;

        }

        return this.sidMap[sid];

    }

    constructor (
        sourcePath: string,
        root: HTMLElement,
        // default function should be empty
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onready: () => void = () => { }
    ) {

        this.onReady = [];
        this.ready = false;
        if (!REGEX_SUBDOC_PATH.test(sourcePath)) {

            console.error(`path '${sourcePath}' is not properly formatted`
            + "for a subdoc document.\nexpected '*.subdoc.html'");

        }

        const client = new XMLHttpRequest();

        client.open("GET", sourcePath);
        client.onload = () => {

            const raw: string = client.response;
            const converted = raw.replace(REGEX_SID_REPLACE, (
                _match,
                before,
                sid,
                after
            ) => `<${before}data-generated-sid="${sid}"${after}>`);

            root.innerHTML = converted;
            this.root = root;
            root.querySelectorAll("[data-generated-sid]")
                .forEach((sidElement: HTMLElement | SVGElement) => {

                    this.sidMap[sidElement.dataset.generatedSid] = sidElement;

                });

            this.ready = true;
            onready();
            this.onReady.forEach((callback) => callback());

        };

        client.send();

    }

}
