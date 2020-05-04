const CONSOLE_COLOR_MAP = {
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

const FOREGROUND_MAP = {
    BLACK: CONSOLE_COLOR_MAP.FOREGROUND.DARK.BLACK,
    RED: CONSOLE_COLOR_MAP.FOREGROUND.DARK.RED,
    GREEN: CONSOLE_COLOR_MAP.FOREGROUND.DARK.GREEN,
    YELLOW: CONSOLE_COLOR_MAP.FOREGROUND.DARK.YELLOW,
    BLUE: CONSOLE_COLOR_MAP.FOREGROUND.DARK.BLUE,
    MAGENTA: CONSOLE_COLOR_MAP.FOREGROUND.DARK.MAGENTA,
    CYAN: CONSOLE_COLOR_MAP.FOREGROUND.DARK.CYAN,
    WHITE: CONSOLE_COLOR_MAP.FOREGROUND.DARK.WHITE,

    LIGHT_BLACK: CONSOLE_COLOR_MAP.FOREGROUND.LIGHT.BLACK,
    LIGHT_RED: CONSOLE_COLOR_MAP.FOREGROUND.LIGHT.RED,
    LIGHT_GREEN: CONSOLE_COLOR_MAP.FOREGROUND.LIGHT.GREEN,
    LIGHT_YELLOW: CONSOLE_COLOR_MAP.FOREGROUND.LIGHT.YELLOW,
    LIGHT_BLUE: CONSOLE_COLOR_MAP.FOREGROUND.LIGHT.BLUE,
    LIGHT_MAGENTA: CONSOLE_COLOR_MAP.FOREGROUND.LIGHT.MAGENTA,
    LIGHT_CYAN: CONSOLE_COLOR_MAP.FOREGROUND.LIGHT.CYAN,
    LIGHT_WHITE: CONSOLE_COLOR_MAP.FOREGROUND.LIGHT.WHITE
};

const BACKGROUND_MAP = {
    BLACK: CONSOLE_COLOR_MAP.BACKGROUND.DARK.BLACK,
    RED: CONSOLE_COLOR_MAP.BACKGROUND.DARK.RED,
    GREEN: CONSOLE_COLOR_MAP.BACKGROUND.DARK.GREEN,
    YELLOW: CONSOLE_COLOR_MAP.BACKGROUND.DARK.YELLOW,
    BLUE: CONSOLE_COLOR_MAP.BACKGROUND.DARK.BLUE,
    MAGENTA: CONSOLE_COLOR_MAP.BACKGROUND.DARK.MAGENTA,
    CYAN: CONSOLE_COLOR_MAP.BACKGROUND.DARK.CYAN,
    WHITE: CONSOLE_COLOR_MAP.BACKGROUND.DARK.WHITE,

    LIGHT_BLACK: CONSOLE_COLOR_MAP.BACKGROUND.LIGHT.BLACK,
    LIGHT_RED: CONSOLE_COLOR_MAP.BACKGROUND.LIGHT.RED,
    LIGHT_GREEN: CONSOLE_COLOR_MAP.BACKGROUND.LIGHT.GREEN,
    LIGHT_YELLOW: CONSOLE_COLOR_MAP.BACKGROUND.LIGHT.YELLOW,
    LIGHT_BLUE: CONSOLE_COLOR_MAP.BACKGROUND.LIGHT.BLUE,
    LIGHT_MAGENTA: CONSOLE_COLOR_MAP.BACKGROUND.LIGHT.MAGENTA,
    LIGHT_CYAN: CONSOLE_COLOR_MAP.BACKGROUND.LIGHT.CYAN,
    LIGHT_WHITE: CONSOLE_COLOR_MAP.BACKGROUND.LIGHT.WHITE
};

class ConsoleColor
{
    foreGround;
    backGround;

    ApplyTo(text)
    {
        const foreGround = this.foreGround ? FOREGROUND_MAP[this.foreGround] : "";
        const backGround = this.foreGround ? BACKGROUND_MAP[this.backGround] : "";
        return foreGround + backGround + text + CONSOLE_COLOR_MAP.RESET;
    }

    Log(text)
    {
        console.log(this.ApplyTo(text));
    }

    constructor(foreGround = "", backGround = "")
    {
        this.foreGround = foreGround;
        this.backGround = backGround;
    }
}

module.exports.ConsoleColor = ConsoleColor;