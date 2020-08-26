const listElement = document.getElementById("list");

const _ = require("lodash");

let numSelected: number = 0;

export class GTreeNode
{
    gElement: SVGGElement;
    checkBox: HTMLInputElement;
    listItemContent: HTMLElement;

    parent: GTreeNode;
    children: GTreeNode[];

    constructor (gElement: SVGGElement, checkBox: HTMLInputElement, listItemContent: HTMLElement, parent: GTreeNode)
    {
        this.gElement = gElement;
        this.checkBox = checkBox;
        this.listItemContent = listItemContent;

        this.parent = parent;
        this.children = [];
    }

    addChild(gElement: SVGGElement, checkBox: HTMLInputElement, listItemContent: HTMLElement): GTreeNode
    {
        const result = new GTreeNode(gElement, checkBox, listItemContent, this);
        this.children.push(result);
        return result;
    }

    getSelfAndDescendants(): GTreeNode[]
    {
        return [
            this,
            ...(_.flatten(
                this.children
                    .map(child => child.getSelfAndDescendants())
            ))
        ];
    }

    getSelfAndAncestors(): GTreeNode[]
    {
        return [
            this,
            ...(this.parent === null
                ? []
                : this.parent.getSelfAndAncestors())
        ];
    }

    setupLogic()
    {
        const descendants: GTreeNode[] = _.flatten(
            this.children
                .map(child => child.getSelfAndDescendants())
        );
        const ancestors =
            this.parent === null
                ? []
                : this.parent.getSelfAndAncestors();

        const ancestorsAndDescendants = [
            ...descendants,
            ...ancestors
        ];

        const allConnected = [
            ...ancestorsAndDescendants,
            this
        ];

        this.checkBox.addEventListener("input", () => onCheckbox(
            allConnected.map(value => value.gElement),
            this.checkBox,
            ancestorsAndDescendants.map(value => value.checkBox)
        ));

        this.children.forEach(child => child.setupLogic());

        this.listItemContent.addEventListener("mouseenter", () =>
        {
            allConnected
                .map(focusElement => focusElement.gElement)
                .forEach(focusElement => focusElement.classList.add("focussed"));
            listElement.classList.add("any-hovered");
        });
        this.listItemContent.addEventListener("mouseleave", () =>
        {
            allConnected
                .map(focusElement => focusElement.gElement)
                .forEach(focusElement => focusElement.classList.remove("focussed"));
            listElement.classList.remove("any-hovered");
        });
    }

}

export function getListEntry(text?: string)
{
    return `
        <p>
        <input type="checkbox">
        ${
        text
            ? text
            : "&LeftAngleBracket;g&RightAngleBracket;"
        }
        </p>
        <ol>
        </ol>
    `;
}

function onCountableSelect(offset: 1 | -1, element: HTMLOrSVGElement, disable: () => void, enable: () => void)
{
    const previous = element.dataset.numSelected
        ? parseInt(element.dataset.numSelected)
        : 0;

    const next = previous + offset;

    element.dataset.numSelected = String(next);
    if (next === 0)
    {
        disable();
    }
    else
    {
        enable();
    }
}

function onCheckbox(elements: SVGGElement[], checkBox: HTMLInputElement, toDisable: HTMLInputElement[])
{
    elements.forEach(selectElement =>
    {
        onCountableSelect(
            checkBox.checked ? 1 : -1,
            selectElement,
            () => selectElement.classList.remove("selected"),
            () => selectElement.classList.add("selected")
        );
    });
    toDisable.forEach(selectElement =>
    {
        onCountableSelect(
            checkBox.checked ? 1 : -1,
            selectElement,
            () => selectElement.disabled = false,
            () => selectElement.disabled = true
        );
    });

    numSelected += checkBox.checked
        ? 1
        : -1;

    if (numSelected === 0)
    {
        listElement.classList.remove("any-selected");
    }
    else
    {
        listElement.classList.add("any-selected");
    }
}

export function buildGTree(element: SVGGElement, gTreeIndex: string, list: HTMLOListElement, node: GTreeNode): void
{
    list.innerHTML = "";

    Array.from(element.children)
        .filter(child => child.tagName === "g")
        .forEach((child: SVGGElement, index: number) =>
        {
            //setup child
            /////////////
            const nextGTreeIndex = `${gTreeIndex}.${String(index)}`;

            child.classList.add("g-tree-element");
            child.dataset.index = nextGTreeIndex;

            //setup list item
            /////////////////
            const listEntry = document.createElement("li");
            const childId = child.id;
            listEntry.innerHTML = getListEntry(childId);
            list.appendChild(listEntry);

            const [ pElement, subListElement ] = <[ HTMLElement, HTMLOListElement ]>Array.from(listEntry.children);
            const [ checkBox ] = <[ HTMLInputElement ]>Array.from(pElement.children);

            checkBox.dataset.gTreeIndex = nextGTreeIndex;

            const next = node.addChild(child, checkBox, pElement);
            buildGTree(child, nextGTreeIndex, subListElement, next);
        });
}