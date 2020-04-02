const xml = require("xml2js");
const fs = require("fs");

let ResourceDirectory = "./saved/objects/";

/**
 * convert a standart svg file into an object xml file.
 *
 * in order to convert a file the following operations are done:
 *
 * - load the svg file but remove the root tag.
 * - if a viewport has been set use it to convert all values to a space between -100 and 100 (not implemented yet).
 * - return the result.
 * 
 * @param {String} svgContent svg-formatted string which will be converted
 * 
 * 
 * @return {{}}
 * get the converted xml string, or error code on failure.
 * returns one of the following objects:
 * ```js
 * //on success
 * {
 *     success: true,
 *     content: String() //xml string
 * }
 * //on failure
 * {
 *     success: false,
 *     error: String() //error string
 * }
 * ```
 */
function SvgToObjectXml(svgContent)
{
    let result = null;

    xml.parseString(svgContent, { async: false }, function (error, content)
    {
        if (error)
        {
            result = {
                success: false,
                error: error
            };
            return;
        }

        let innerContent = content.svg;
        if (innerContent === undefined || innerContent === null)
        {
            result = {
                success: false,
                error: "xml file is not properly formatted for svg"
            };
            return;
        }

        //todo: transform all values into normalized coordinates (from -1 to 1)
        delete innerContent["$"];
        innerContent = { root: innerContent };
        let builder = new xml.Builder({
            headless: true,
            normalize: true,
            normalizeTags: true,
            renderOpts: {
                pretty: false
            }
        });
        try
        {
            const tmp = builder.buildObject(innerContent);
            result = {
                success: true,
                content: builder.buildObject(innerContent)
            };
        }
        catch (error)
        {
            result = {
                success: false,
                error: "error when rebuilding svg content:\n" + error
            };
            return;
        }
    });

    return result;
}

/**
 * read objects that are already imported.
 * 
 * the following conditions must be true:
 * 
 * - the root node should be called 'root'.
 * - there must be no whitepace before or after the root node.
 * - while not nescecarily required it is expected that the data is compactly stored with minimal whitespace.
 * 
 * @param {String|String[]} name name or names of the objects that should be loaded
 */
function ReadObjectXml(name)
{
    names = name;
    if (!Array.isArray(name))
    {
        names = [name];
    }

    let result = {};

    for (let i = 0; i < names.length; ++i)
    {
        const fileContent = fs.readFileSync(ResourceDirectory + names[i] + ".xml", "utf8");
        if (!(/^<root>[^]*<\/root>$/.test(fileContent)))
        {
            console.warn("Attempted to read object xml, however no root tags were found '<root>*</root>'\n" + fileContent);
        }
        result[names[i]] = fileContent.substring(6, fileContent.length - 7);
    }

    return result;
}

/**
 * @alias module:DrawObjectXmlhandler.svgToObjectXml
 */
module.exports.SvgToObjectXml = SvgToObjectXml;
/**
 * @alias module:DrawObjectXmlhandler.ReadObjectXml
 */
module.exports.ReadObjectXml = ReadObjectXml;

/**
 * this module is in charge of all DrawObject xml functionality.
 *
 * DrawObject xml is almost the same as svg, however the root tag is omitted and the screen space is always from -100 to 100.
 *
 * @module DrawObjectXmlhandler
 *
 * @see DrawObject
 */