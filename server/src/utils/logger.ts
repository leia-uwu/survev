export const ColorStyles = {
    foreground: {
        black: {
            normal: 30,
            bright: 90,
        },
        red: {
            normal: 31,
            bright: 91,
        },
        green: {
            normal: 32,
            bright: 92,
        },
        yellow: {
            normal: 33,
            bright: 93,
        },
        blue: {
            normal: 34,
            bright: 94,
        },
        magenta: {
            normal: 35,
            bright: 95,
        },
        cyan: {
            normal: 36,
            bright: 96,
        },
        white: {
            normal: 37,
            bright: 97,
        },
        default: {
            normal: 39,
            bright: 39,
        },
    },
    background: {
        black: {
            normal: 40,
            bright: 100,
        },
        red: {
            normal: 41,
            bright: 101,
        },
        green: {
            normal: 42,
            bright: 102,
        },
        yellow: {
            normal: 43,
            bright: 103,
        },
        blue: {
            normal: 44,
            bright: 104,
        },
        magenta: {
            normal: 45,
            bright: 105,
        },
        cyan: {
            normal: 46,
            bright: 106,
        },
        white: {
            normal: 47,
            bright: 107,
        },
        default: {
            normal: 49,
            bright: 49,
        },
    },
} as const;

type Colors = typeof ColorStyles;
type Channel = keyof Colors;
type Color = keyof Colors[Channel];
type Variant = keyof Colors[Channel][Color];

const CSI = "\u001B";
export function styleText(
    string: string,
    ...styles: Array<Colors[Channel][Color][Variant]>
): string {
    return `${CSI}[${styles.join(";")}m${string}${CSI}[0m`;
}

export class Logger {
    constructor(public prefix: string) {}

    log(...message: any[]): void {
        const date = new Date();
        const dateString = `[${date.toISOString().substring(0, 10)} ${date.toLocaleTimeString()}]`;
        console.log(
            styleText(dateString, ColorStyles.foreground.cyan.normal),
            styleText(this.prefix, ColorStyles.foreground.green.normal),
            "|",
            message.join(" "),
        );
    }
    warn(...message: any[]): void {
        this.log(
            styleText("[WARNING]", ColorStyles.foreground.yellow.normal),
            message.join(" "),
        );
    }
}
