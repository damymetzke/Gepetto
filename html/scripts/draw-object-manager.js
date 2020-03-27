const { ipcMain } = require("electron");
const fs = require("fs");
const xml = require("xml2js");

function Init()
{
    ipcMain.handle("import-svg", function (event, arguments)
    {
        let parsingFailed = false;
        let parsingError = "";
        let xmlContent = xml.parseString(fs.readFileSync(arguments.filePath, "utf-8"), { async: false }, function (error, content)
        {
            if (error)
            {
                parsingFailed = true;
                parsingError = error;
                return;
            }

            let innerContent = content.svg;
            if (innerContent === undefined || innerContent === null)
            {
                parsingFailed = true;
                parsingError = "xml file is not properly formatted for svg";
                return;
            }

            delete innerContent["$"];
            innerContent = { g: innerContent };
            let builder = new xml.Builder({ headless: true });
            const tmp = { name: "Super", Surname: "Man", age: 23 };
            let result;
            try
            {
                result = builder.buildObject(innerContent);
            }
            catch (error)
            {
                parsingFailed = true;
                parsingError = "error when rebuilding svg content<br>" + error;
                return;
            }
            console.log(result);
        });

        if (parsingFailed)
        {
            return {
                success: false,
                message: "XML parsing failed with error:<br>" + parsingError
            };
        }

        return {
            success: true
        };
    });
}

module.exports.Init = Init;