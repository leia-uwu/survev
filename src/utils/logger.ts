function internalLog(...message: string[]): void {
    const date = new Date();
    console.log(
        `[${date.toLocaleDateString("en-US")} ${date.toLocaleTimeString("en-US")}]`,
        message.join(" ")
    );
}

export class Logger {
    constructor(public prefix: string) {

    }

    log(...message: string[]): void {
        internalLog(`${this.prefix} |`, message.join(" "));
    }

    warn(...message: string[]): void {
        internalLog(`${this.prefix} | [WARNING]`, message.join(" "));
    }
}
