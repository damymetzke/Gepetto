const { exec } = require("child_process");

const scriptList = [
    "compile:html",
    "compile:typescript",
    "compile:sass"
];

const CONSOLE_COLOR = {
    RESET: "\x1b[0m",

    FOREGROUND: {
        DARK: {
            BLACK: "\x1b[30m",
            RED: "\x1b[31m",
            GREEN: "\x1b[32m",
            YELLOW: "\x1b[33m",
            BLUE: "\x1b[34m",
            MAGENTA: "\x1b[35m",
            CYAN: "\x1b[36m",
            WHITE: "\x1b[37m"
        },
        LIGHT: {
            BLACK: "\x1b[90m",
            RED: "\x1b[91m",
            GREEN: "\x1b[92m",
            YELLOW: "\x1b[93m",
            BLUE: "\x1b[94m",
            MAGENTA: "\x1b[95m",
            CYAN: "\x1b[96m",
            WHITE: "\x1b[97m"
        }
    },
    BACKGROUND: {
        DARK: {
            BLACK: "\x1b[40m",
            RED: "\x1b[41m",
            GREEN: "\x1b[42m",
            YELLOW: "\x1b[43m",
            BLUE: "\x1b[44m",
            MAGENTA: "\x1b[45m",
            CYAN: "\x1b[46m",
            WHITE: "\x1b[47m"
        },
        LIGHT: {
            BLACK: "\x1b[100m",
            RED: "\x1b[101m",
            GREEN: "\x1b[102m",
            YELLOW: "\x1b[103m",
            BLUE: "\x1b[104m",
            MAGENTA: "\x1b[105m",
            CYAN: "\x1b[106m",
            WHITE: "\x1b[107m"
        }
    }
};

function ApplyColors(text)
{
    const colorArguments = Array.from(arguments).slice(1);
    const colorString = colorArguments.reduce((argument, string) =>
    {
        return string + argument;
    });

    return colorString + text + CONSOLE_COLOR.RESET;

}

function RunNpmScript(script)
{
    const scriptName = script.toUpperCase().replace(":", "_");
    exec(`npm run ${script}`, (_error, stdout, _stderr) =>
    {
        const toPrint = ApplyColors(`${scriptName}_OUTPUT_START`, CONSOLE_COLOR.FOREGROUND.DARK.BLACK, CONSOLE_COLOR.BACKGROUND.LIGHT.BLUE)
            + stdout
            + ApplyColors(`${scriptName}_OUTPUT_END`, CONSOLE_COLOR.FOREGROUND.DARK.BLACK, CONSOLE_COLOR.BACKGROUND.LIGHT.BLUE);
        console.log(toPrint);
    });
}

console.log(ApplyColors(`Compiling scripts:`, CONSOLE_COLOR.FOREGROUND.LIGHT.MAGENTA));
scriptList.forEach((script) =>
{
    console.log(ApplyColors(`*  ${script}`, CONSOLE_COLOR.FOREGROUND.LIGHT.BLUE));
});

scriptList.forEach((script) =>
{
    RunNpmScript(script);
});