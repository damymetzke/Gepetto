const variableReplace = /<\$((.*)="(.*)"|[^="].*)\$>/gu;
const subdocTag = /^\s*<!subdoc([^]*?)>/gu;
const sidReplace = /<([^>]*)sid="(.*?)"([^<]*)>/gu;

const ParseSubdocError = "<p style='color:red'>oops,"
+ "it seems something went wrong parsing a subdoc!</p>";

type SubdocVariables = { [name: string]: string; };
type SidTable = { [sid: string]: HTMLElement | SVGElement; };

function ParseSubdoc (raw: string, variables: SubdocVariables) {

    const subdocMatch = subdocTag.exec(raw);

    if (!subdocMatch) {

        return ParseSubdocError;

    }

    // remove <!subdoc> tag
    return raw.replace(subdocTag, () => "").replace(variableReplace, (
        _match,
        noDefaultName, defaultName, defaultValue, _offset, _string
    ) => {

        if (typeof defaultValue === "undefined") {

            return (defaultName in variables)
                ? variables[noDefaultName]
                : defaultValue;

        }

        return (noDefaultName in variables)
            ? variables[noDefaultName]
            : "";

    })
    // replace sid="" with data-generated-sid=""
        .replace(sidReplace, (
            _match,
            before,
            sid,
            after
        ) => `<${before}data-generated-sid="${sid}"${after}>`);

}

function CollectSid (element: HTMLElement | SVGElement): SidTable {

    const defaultValue: SidTable = {};

    if (("generatedSid" in element.dataset)) {

        defaultValue[element.dataset.generatedSid] = element;

    }

    return Array.from(element.children).reduce((
        accumelator: SidTable,
        child: HTMLElement | SVGElement, _index, _array
    ) => ({...accumelator,
        ...CollectSid(child)}), defaultValue);

}

export class SubDocHandler {

    root: HTMLDivElement;

    sidTable: SidTable = {};

    GetElementBySid (sid: string): HTMLElement | SVGElement {

        return (sid in this.sidTable)
            ? this.sidTable[sid]
            : null;

    }

    constructor (raw: string, variables: SubdocVariables = {}) {

        this.root = document.createElement("div");
        this.root.classList.add("subdoc-container");
        this.root.innerHTML = ParseSubdoc(raw, variables);
        this.sidTable = CollectSid(this.root);

    }

}
