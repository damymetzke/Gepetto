const Sass = require("npm-sass");
const fs = require("fs");

const { ConsoleColor } = require("./console-color");

const Color = require("./color");

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

Color.Log(`(header){Compiling Sass:}${files.reduce((accumelator, file) => { return `${accumelator}\n*  (file){"${file.from}"} > (file){"${file.to}"}`; }, "")}`, [], {
    header: Color.HEADER,
    file: Color.FILE
});

if (!fs.existsSync("./out/style"))
{
    fs.mkdirSync("./out/style", { recursive: true });
}

files.forEach((file) =>
{
    Sass(file.from, (_error, result) =>
    {
        fs.writeFile(file.to, result.css, () => { });
    });
});
