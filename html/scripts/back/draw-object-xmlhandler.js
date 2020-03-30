const xml = require("xml2js");

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

module.exports.SvgToObjectXml = SvgToObjectXml;