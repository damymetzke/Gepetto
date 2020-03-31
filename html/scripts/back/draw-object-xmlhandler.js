const xml = require("xml2js");

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
    console.log(svgContent);

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
        innerContent = { g: innerContent };
        let builder = new xml.Builder({ headless: true });
        try
        {
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
 * @alias module:DrawObjectXmlhandler.svgToObjectXml
 */
module.exports.SvgToObjectXml = SvgToObjectXml;

/**
 * this module is in charge of all DrawObject xml functionality.
 *
 * DrawObject xml is almost the same as svg, however the root tag is omitted and the screen space is always from -100 to 100.
 *
 * @module DrawObjectXmlhandler
 *
 * @see DrawObject
 */