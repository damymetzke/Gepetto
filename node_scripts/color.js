const inlineColorReplace = /\(([a-zA-Z]+)\){([^{]*?)}/g;

const EFFECTS = {
    "RESET": 0,

    "BOLD": 1,
    "UNDERLINE": 4,
    "CROSSED": 9,

    "FG_BLACK": 30,
    "FG_RED": 31,
    "FG_GREEN": 32,
    "FG_YELLOW": 33,
    "FG_BLUE": 34,
    "FG_MAGENTA": 35,
    "FG_CYAN": 36,
    "FG_WHITE": 37,

    "BG_BLACK": 40,
    "BG_RED": 41,
    "BG_GREEN": 42,
    "BG_YELLOW": 43,
    "BG_BLUE": 44,
    "BG_MAGENTA": 45,
    "BG_CYAN": 46,
    "BG_WHITE": 47,

    "FRAMED": 51,
    "ENCIRCLED": 52,
    "OVERLINED": 53,

    "FG_BRIGHT_BLACK": 90,
    "FG_BRIGHT_RED": 91,
    "FG_BRIGHT_GREEN": 92,
    "FG_BRIGHT_YELLOW": 93,
    "FG_BRIGHT_BLUE": 94,
    "FG_BRIGHT_MAGENTA": 95,
    "FG_BRIGHT_CYAN": 96,
    "FG_BRIGHT_WHITE": 97,

    "BG_BRIGHT_BLACK": 100,
    "BG_BRIGHT_RED": 101,
    "BG_BRIGHT_GREEN": 102,
    "BG_BRIGHT_YELLOW": 103,
    "BG_BRIGHT_BLUE": 104,
    "BG_BRIGHT_MAGENTA": 105,
    "BG_BRIGHT_CYAN": 106,
    "BG_BRIGHT_WHITE": 107,
};

const WARN = [EFFECTS["FG_BRIGHT_YELLOW"]];
const ERROR = [EFFECTS["FG_BRIGHT_RED"]];
const FILE = [EFFECTS["FG_BRIGHT_CYAN"], EFFECTS["UNDERLINE"]];
const HEADER = [EFFECTS["FG_BRIGHT_MAGENTA"], EFFECTS["BOLD"], EFFECTS["UNDERLINE"]];

const DEFAULT_INLINE_COLORS = {
    warn: WARN,
    error: ERROR,
    file: FILE,
    header: HEADER
};

function Format(text, globalColor = [], inlineColors = {})
{
    const before = globalColor.reduce((accumelator, effect) =>
    {
        return `${accumelator}\x1b[${effect.toString()}m`;
    }, "");

    const resultingInlineColors = {
        ...DEFAULT_INLINE_COLORS,
        ...inlineColors
    };

    const converted = text.replace(inlineColorReplace, (match, inlineColor, inlineText) =>
    {
        if (!(inlineColor in resultingInlineColors))
        {
            return inlineText;
        }

        const inlineBefore = resultingInlineColors[inlineColor].reduce((accumelator, effect) =>
        {
            return `${accumelator}\x1b[${effect.toString()}m`;
        }, "");

        return `${inlineBefore}${inlineText}\x1b[${EFFECTS["RESET"]}m${before}`;
    });

    return `${before}${converted}\x1b[${EFFECTS["RESET"]}m`;
}

function Log(text, globalColor = [], inlineColors = {})
{
    console.log(Format(text, globalColor, inlineColors));
}

function Error(text, globalColor = ERROR, inlineColors = {})
{
    console.error(Format(text, globalColor, inlineColors));
}

module.exports = {
    EFFECTS,
    Format,
    Log,
    Error,
    WARN,
    ERROR,
    FILE,
    HEADER
};