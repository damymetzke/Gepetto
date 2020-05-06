const variableReplace = /<\$((.*)="(.*)"|[^="].*)\$>/g;
const subdocTag = /^\s*<!subdoc([^]*?)>/g;
const sidReplace = /<([^>\n]*)sid="(.*?)"([^<\n]*)>/g;

const ParseSubdocError = "<p style='color:red'>oops, it seems something went wrong parsing a subdoc!</p>";

type SubdocVariables = { [name: string]: string; };
type SidTable = { [sid: string]: HTMLElement | SVGElement; };

function ParseSubdoc(raw: string, variables: SubdocVariables)
{
    let subdocMatch = subdocTag.exec(raw);
    if (!subdocMatch)
    {
        return ParseSubdocError;
    }

    return raw.replace(subdocTag, () => //remove <!subdoc> tag
    {
        return "";
    }).replace(variableReplace, (_match, noDefaultName, defaultName, defaultValue, _offset, _string) =>
    {
        if (defaultValue !== undefined)
        {
            return (defaultName in variables) ? variables[noDefaultName] : defaultValue;
        }

        return (noDefaultName in variables) ? variables[noDefaultName] : "";
    }).replace(sidReplace, (_match, before, sid, after, _offset, _string) => //replace sid="" with data-generated-sid=""
    {
        return `<${before}data-generated-sid="${sid}"${after}>`;
    });
}

function CollectSid(element: HTMLElement | SVGElement): SidTable
{
    let defaultValue: SidTable = {};
    if (("generatedSid" in element.dataset))
    {
        defaultValue[element.dataset.generatedSid] = element;
    }

    return Array.from(element.children).reduce((accumelator: SidTable, child: HTMLElement | SVGElement, _index, _array) =>
    {
        return { ...accumelator, ...CollectSid(child) };
    }, defaultValue);
}

export class SubDocHandler
{
    root: HTMLDivElement;
    sidTable: SidTable = {};

    GetElementBySid(sid: string): HTMLElement | SVGElement
    {
        return (sid in this.sidTable) ? this.sidTable[sid] : null;
    }

    constructor(raw: string, variables: SubdocVariables = {})
    {
        this.root = document.createElement("div");
        this.root.classList.add("subdoc-container");
        this.root.innerHTML = ParseSubdoc(raw, variables);
        this.sidTable = CollectSid(this.root);
    }
}