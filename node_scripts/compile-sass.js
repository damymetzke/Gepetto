const Sass = require("npm-sass");
const fs = require("fs");

const { ConsoleColor } = require("./console-color");

const outputColor = new ConsoleColor("LIGHT_MAGENTA", "BLACK");
const fileColor = new ConsoleColor("LIGHT_YELLOW", "BLACK");


outputColor.Log("Compiling Sass:");
console.log(`*  ${fileColor.ApplyTo('"./style/style.scss"')} > ${fileColor.ApplyTo('"./out/style/style.css"')}`);
Sass("./style/style.scss", (_error, result) =>
{
    if (!fs.existsSync("./out/style"))
    {
        fs.mkdirSync("./out/style", { recursive: true });
    }
    fs.writeFileSync("./out/style/style.css", result.css);
});