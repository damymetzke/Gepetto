import { promises as fs } from "fs";
import { xml2js, js2xml, Element } from "xml-js";
import { TransformCommand, TransformCommandType } from "../core/core";
import * as path from "path";

const REGEX_VIEW_BOX = /(?:\s|,)+/g;
const REGEX_SUBOBJECT_NOTATION = /#([1aAiI])/;
const REGEX_SUBOBJECT_ID = /^(?:[0-9][0-9\.]*[0-9]|[0-9]+)$/;
const REGEX_VALIDATE_FINAL_NAME = /^[a-z][a-z0-9_]*$/i;


const NUMERALS = [
    "i",
    "v",
    "x",
    "l",
    "c",
    "d",
    "m",
    "̅v",
    "̅x",
    "̅̅l",
    "̅c",
    "̅d",
    "̅m"
];

function numberToRoman(n: number): string
{
    if (n < 1)
    {
        return "";
    }

    let upperBound = 1;
    let index = 0;
    let even = false;
    while (upperBound < n)
    {
        upperBound *= even
            ? 2
            : 5;

        even = !even;
        ++index;
    }

    if (n === upperBound)
    {
        return NUMERALS[ index ];
    }

    const subtractOffset = even
        ? upperBound / 5
        : upperBound / 10;

    if (n >= upperBound - subtractOffset)
    {
        return `${numberToRoman(subtractOffset)}${NUMERALS[ index ]}${numberToRoman(n - upperBound + subtractOffset)}`;
    }

    const previousValue = upperBound / (even
        ? 5
        : 2);

    const numSymbols = Math.floor(n / previousValue);
    return `${NUMERALS[ index - 1 ].repeat(numSymbols)}${numberToRoman(n - (previousValue * numSymbols))}`;
}

export interface svgConvertInput
{
    sourcePath: string;
    name: string;
    subObjects: string[];
}

async function convertSingleObject(name: string, transformString: string, elements: Element[]): Promise<string[]>
{
    if (!REGEX_VALIDATE_FINAL_NAME.test(name))
    {
        throw `Invalid name: ${name}`;
    }
    const root = <Element>{
        type: "element",
        name: "g",
        attributes: {
            transform: transformString
        },
        elements: elements
    };

    console.log(root);

    const data = js2xml({
        elements: [ root ]
    }, {
        ignoreComment: true
    });
    await fs.writeFile(path.join("saved/objects", `${name}.xml`), data);

    return [ name ];

}

function getSubObject(elements: Element[], index: number[]): Element[]
{
    if (index.length === 0)
    {
        if (elements.length === 0)
        {
            throw "Input contains empty sub-object!";
        }
        return elements;
    }

    const [ currentIndex ] = index;
    const nextIndex = index.splice(1);

    const gElements = elements.filter(element => element.type === "element" && element.name === "g");
    if (currentIndex >= gElements.length)
    {
        throw "Input contains non-existing subobject!";
    }

    return getSubObject(gElements[ currentIndex ].elements, nextIndex);
}

async function convertMultipleObjects(name: string, transformString: string, elements: Element[], subObjects: string[]): Promise<string[]>
{
    //todo: include transforms of subobject chain into final result

    //create default name if '#' notation is missing
    const subName = REGEX_SUBOBJECT_NOTATION.test(name)
        ? name
        : `${name}_#1`;

    //test for nested subobjects
    let testedObjects: string[] = [];

    subObjects.forEach(subObject =>
    {
        if (!REGEX_SUBOBJECT_ID.test(subObject))
        {
            throw `Subobject is improperly formatted!\nExpecting format like '1.2.3'.\nRecieved: '${subObject}'.`;
        }

        testedObjects.forEach(testedSubObject =>
        {
            const testedIsSmaller = testedSubObject.length < subObject.length;

            const smallest = testedIsSmaller
                ? testedSubObject
                : subObject;

            const biggest = testedIsSmaller
                ? subObject
                : testedSubObject;

            const biggestSubString = biggest.slice(0, smallest.length);

            if (smallest === biggestSubString)
            {
                throw "Input contains nested subobjects!";
            }

        });

        testedObjects.push(subObject);
    });

    //get subobjects, test if all objects exist and are non-empty
    const subElements = subObjects.map(subObject =>
    {
        const index = subObject.split(".").map(value => parseInt(value));
        return getSubObject(elements, index);
    });

    const results = subElements.map(async (subElement, index) =>
    {
        const thisName = subName.replace(REGEX_SUBOBJECT_NOTATION, (_match, letter) =>
        {
            switch (letter)
            {
                case "1":
                    return String(index + 1);
                case "a":
                    return String.fromCharCode("a".charCodeAt(0) + index);
                case "A":
                    return String.fromCharCode("A".charCodeAt(0) + index);
                case "i":
                    return numberToRoman(index + 1);
                case "I":
                    return numberToRoman(index + 1).toUpperCase();
            }
        });

        if (!REGEX_VALIDATE_FINAL_NAME.test(thisName))
        {
            throw `Invalid sub-object name: ${thisName}`;
        }

        const data = js2xml({
            elements: [ {
                type: "element",
                name: "g",
                attributes: {
                    transform: transformString
                },
                elements: subElement
            } ]
        }, {
            ignoreComment: true
        });

        await fs.writeFile(path.join("saved/objects", `${thisName}.xml`), data);
        return thisName;


    });

    return Promise.all(results).then((values) =>
    {
        return values;
    });
}

export async function convertSvg(input: svgConvertInput): Promise<string[]>
{
    const { sourcePath, name, subObjects } = input;
    const data = await fs.readFile(sourcePath);
    const xml = <Element>xml2js(data.toString());
    const topElements = xml.elements.filter(element => element.type === "element" && element.name === "svg");
    if (topElements.length !== 1)
    {
        throw `Expected a single top element called svg, got ${String(topElements.length)} instead!`;
    }

    const [ root ] = topElements;

    if (!("elements" in root))
    {
        throw "Svg element does not have any child elements!";
    }

    if (!("attributes" in root) || !("viewBox" in root.attributes))
    {
        throw "Svg element does not have a viewbox attribute!";
    }

    const viewBox = String(root.attributes.viewBox).split(REGEX_VIEW_BOX);
    if (viewBox.length !== 4)
    {
        throw "viewBox attribute is improperly formatted!";
    }
    const [ minX, minY, width, height ] = viewBox.map(value => Number(value));
    const maxSize = Math.max(width, height);

    const ratio = 200 / maxSize;
    const offsetX = -minX;
    const offsetY = -minY;

    const translateTransform1 = new TransformCommand(TransformCommandType.TRANSLATE, {
        x: offsetX,
        y: offsetY
    });
    const scaleTransform = new TransformCommand(TransformCommandType.SCALE, {
        x: ratio,
        y: ratio
    });
    const translateTransform2 = new TransformCommand(TransformCommandType.TRANSLATE, {
        x: -100,
        y: -100
    });

    const transform = translateTransform1.GetTransform()
        .Add(scaleTransform.GetTransform())
        .Add(translateTransform2.GetTransform());

    const transformString = transform.svgString();

    const children = root.elements;

    if (subObjects.length === 0)
    {
        return convertSingleObject(name, transformString, children);
    }
    return convertMultipleObjects(name, transformString, children, subObjects);

}