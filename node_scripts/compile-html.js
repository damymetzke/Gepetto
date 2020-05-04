const fs = require("fs");

const inputPath = "./html/";
const outputPath = "./out/";

function ConvertFiles(relativePath)
{
    const dir = inputPath + relativePath;
    const files = fs.readdirSync(dir);
    files.forEach((file) =>
    {
        fullPath = dir + file;
        const stat = fs.statSync(fullPath);

        if (stat && stat.isDirectory())
        {
            ConvertFiles(relativePath + file + "/");
        } else
        {
            fs.readFile(inputPath + relativePath + file, (_err, data) =>
            {
                if (!fs.existsSync(outputPath + relativePath))
                {
                    fs.mkdirSync(outputPath + relativePath, { recursive: true });
                }

                fs.writeFile(outputPath + relativePath + file, data, () => { });
            });
        }

    });
}
ConvertFiles("");