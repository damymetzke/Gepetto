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

/**
 * input data that will be used to convert an svg file to its desired xml files.
 */
export interface svgConvertInput
{
    /**
     * path to a standard svg file.
     */
    sourcePath: string;
    /**
     * name of the resulting object(s).
     * 
     * this name will determine the name of the object(s),
     * as well as the names of the file(s) on disk.
     * 
     * the name can only contain alphanumerical characters [a-z 0-9] and underscores [_].
     * the first character has to be an alphabetical character [a-z].
     * 
     * when at least 1 sub-object is defined the name also supports pound notation (#).
     * the pattern `#?` will be converted to a counting character.
     * different values for '?' will result in different counting characters:
     * * #1 will result in numbers (1, 2, 3, 4, 5)
     * * #a/#A will result in lettes (a, b, c, d, e)/(A, B, C, D, E)
     * * #i/#I will result in roman numerals (i, ii, iii, iv, v)/(I, II, III, IV, V)
     * 
     * only the first pound notation will be converted.
     * any pound notations with values that are not recognized will be ignored.
     * if the resulting name still has a pound sign the name is invalid.
     * this means that only a single pound notation can be used.
     * 
     * if no pound notation is found `_#1` will be appended.
     * so `my_object` is implicitly converted to `my_object_#1` before calculateing sub-object names.
     * 
     * invalid names will result in an rejection.
     */
    name: string;
    /**
     * list of objects that should be created from the svg file.
     * 
     * if at least 1 subObject is defined multiple objects will be created.
     * 
     * sub-objects can be created using the consept of the `g-tree`.
     * this is the tree consisting of only g elements.
     * any g elements which are nested in other elements are not part of the g-tree.
     * 
     * ```xml
     * <g id="1">
     *     <g id="3">
     *     </g>
     * </g>
     * <element>
     *     <g id="2">
     *     </g>      
     * </element>
     * ```
     * in this example element 1 is part of the g-tree, since its a root element.
     * element 2 is nested in a non-g element, and is not part of the g-tree.
     * element 3 is nested in a g-element which is part of the g-tree, so its part of the g-tree.
     * 
     * specific g elements in the g-tree are referenced using a special notation.
     * this notation is what the input uses to determine sub-objects.
     * the notation is a list of o based indices, separated by dots [.].
     * note that non-g-tree elements are ignored;
     * even if the first element is a non-g element,
     * the first *g* element will have an index of 0.
     * 
     * ```xml
     * <g id="0">
     *     <g id="0.0">
     *         <g id=0.0.0>
     *         </g>
     *     </g>
     *     <g id="0.1">
     *         <g id=0.1.0>
     *         </g>
     *         <g id=0.1.1>
     *         </g>
     *     </g>
     *     <g id="0.2">
     *     </g>
     * </g>
     * <g id="1">
     * </g>
     * <g id="2">
     * </g>
     * ```
     * in this example the id is the same as the required notation.
     * 
     * sub-objects can have a comman ancestor, but cannot be nested in each other.
     * so `1.2` and `1.4` can both but used as input, since they only have a comman ancestor.
     * but `1.2` and `1.2.1` connot both be used as input, since `1.2.1` is a decendent of `1.2`.
     * nested sub-objects will result in a rejection.
     * 
     * a notation which does not correspond to an existing sub-object in the g-tree will result in a rejection.
     */
    subObjects: string[];
}

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

/**
 * convert an svg file into 1 or more xml files that can be used for objects.
 * 
 * this function will read and write to the disk,
 * it will only except filepaths and only return names that can be converted to filepaths.
 * 
 * the sole purpose of the function is to convert,
 * any detecting of svg structure and other things should be done externally.
 * 
 * @returns list of object names.
 * these correspond to the location on disk.
 */
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