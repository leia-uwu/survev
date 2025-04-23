import { styleText } from "util";
import { Config } from "../config";
import { logErrorToWebhook } from "./serverHelpers";

const logCfg = Config.logging;

export class Logger {
    constructor(public prefix: string) {}

    private log(logFn = console.log, ...message: any[]): void {
        if (logCfg.logDate) {
            const date = new Date();
            const dateString = `[${date.toISOString().substring(0, 10)} ${date.toLocaleTimeString()}]`;

            logFn(
                styleText("cyan", dateString),
                styleText("green", this.prefix),
                "|",
                message.join(" "),
            );
        } else {
            logFn(styleText("green", this.prefix), "|", message.join(" "));
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
        this.log(undefined, styleText("blue", "[INFO]"), ...message);
    }

    debug(...message: any[]): void {
        if (!logCfg.debugLogs) return;
        this.log(
            undefined,
            // not a typo, just want it to align with the others :D
            styleText("magenta", "[DEBG]"),
            ...message,
        );
    }

    warn(...message: any[]): void {
        if (!logCfg.warnLogs) return;
        this.log(console.warn, styleText("yellow", "[WARN]"), ...message);
    }

    error(...message: any[]): void {
        if (!logCfg.errorLogs) return;
        this.log(console.error, styleText("red", "[ERROR]"), ...message);
        logErrorToWebhook("server", ...message);
    }
}

export const defaultLogger = new Logger("Generic");
