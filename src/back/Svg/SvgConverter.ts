import { promises as fs } from "fs";
import { xml2js, js2xml, Element } from "xml-js";
import { TransformCommand, TransformCommandType } from "../core/core";
import * as path from "path";

const REGEX_VIEW_BOX = /(?:\s|,)+/g;

export interface svgConvertInput
{
    sourcePath: string;
    name: string;
    subObjects: string[];
}

async function convertSingleObject(name: string, transformString: string, elements: Element[]): Promise<void>
{
    const root = <Element>{
        type: "element",
        name: "g",
        attributes: {
            viewBox: transformString
        },
        elements: elements
    };

    console.log(root);

    const data = js2xml({
        elements: [ root ]
    }, {
        ignoreComment: true
    });
    return fs.writeFile(path.join("saved/objects", `${name}__2.xml`), data);
}

async function convertMultipleObjects(): Promise<void>
{
    return;
}

export async function convertSvg(input: svgConvertInput): Promise<void>
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
    return convertMultipleObjects();

}