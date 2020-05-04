const Sass = require("npm-sass");
const fs = require("fs");

const { ConsoleColor } = require("./console-color");

const outputColor = new ConsoleColor("LIGHT_MAGENTA", "BLACK");
const fileColor = new ConsoleColor("LIGHT_YELLOW", "BLACK");

const files = [
    {
        from: "./style/index/index.scss",
        to: "./out/style/index.css"
    },
    {
        from: "./style/svg-import/svg-import.scss",
        to: "./out/style/svg-import.css"
    }
];

outputColor.Log("Compiling Sass:");

if (!fs.existsSync("./out/style"))
{
    fs.mkdirSync("./out/style", { recursive: true });
}

files.forEach((file) =>
{
    console.log(`*  ${fileColor.ApplyTo(`"${file.from}"`)} > ${fileColor.ApplyTo(`"${file.to}"`)}`);
});

files.forEach((file) =>
{
    Sass(file.from, (_error, result) =>
    {
        fs.writeFileSync(file.to, result.css);
    });
});
