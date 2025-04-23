import { Config } from "../config";
import { logErrorToWebhook } from "./serverHelpers";

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

const logCfg = Config.logging;

export class Logger {
    constructor(public prefix: string) {}

    private log(logFn = console.log, ...message: any[]): void {
        if (logCfg.logDate) {
            const date = new Date();
            const dateString = `[${date.toISOString().substring(0, 10)} ${date.toLocaleTimeString()}]`;

            logFn(
                styleText(dateString, ColorStyles.foreground.cyan.normal),
                styleText(this.prefix, ColorStyles.foreground.green.normal),
                "|",
                message.join(" "),
            );
        } else {
            logFn(
                styleText(this.prefix, ColorStyles.foreground.green.normal),
                "|",
                message.join(" "),
            );
        }

        // to print full error messages
        for (const msg of message) {
            if (msg instanceof Error) {
                logFn(msg);
            }
        }
    }

    info(...message: any[]): void {
        if (!logCfg.infoLogs) return;
        this.log(
            undefined,
            styleText("[INFO]", ColorStyles.foreground.blue.normal),
            ...message,
        );
    }

    debug(...message: any[]): void {
        if (!logCfg.debugLogs) return;
        this.log(
            undefined,
            // not a typo, just want it to align with the others :D
            styleText("[DEBG]", ColorStyles.foreground.magenta.normal),
            ...message,
        );
    }

    warn(...message: any[]): void {
        if (!logCfg.warnLogs) return;
        this.log(
            console.warn,
            styleText("[WARN]", ColorStyles.foreground.yellow.normal),
            ...message,
        );
    }

    error(...message: any[]): void {
        if (!logCfg.errorLogs) return;
        this.log(
            console.error,
            styleText("[ERROR]", ColorStyles.foreground.red.normal),
            ...message,
        );
        logErrorToWebhook("server", ...message);
    }
}

export const defaultLogger = new Logger("Generic");
