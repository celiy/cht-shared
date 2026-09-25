export type PrintSegment = {
    value: unknown;
    fg?: string;
    bg?: string;
};

function stringifySegment(value: unknown): string {
    if (typeof value === "string") {
        return value;
    }

    if (value === null || value === undefined) {
        return "";
    }

    if (typeof value === "object") {
        try {
            return JSON.stringify(value);
        } catch {
            return String(value);
        }
    }

    return String(value);
}

export class PrettyConsole {
    public closeByNewLine: boolean;
    public useIcons: boolean;
    public logsTitle: string;
    public warningsTitle: string;
    public errorsTitle: string;
    public informationsTitle: string;
    public successesTitle: string;
    public debugsTitle: string;
    public assertsTitle: string;

    constructor() {
        this.closeByNewLine = true;
        this.useIcons = true;
        this.logsTitle = "LOGS";
        this.warningsTitle = "WARNINGS";
        this.errorsTitle = "ERRORS";
        this.informationsTitle = "INFORMATIONS";
        this.successesTitle = "SUCCESS";
        this.debugsTitle = "DEBUG";
        this.assertsTitle = "ASSERT";
    }

    private getColor(foregroundColor: string = "", backgroundColor: string = ""): string {
        let fgc = "\x1b[37m";

        switch (foregroundColor.trim().toLowerCase()) {
            case "black":
                fgc = "\x1b[30m";
                break;
            case "red":
                fgc = "\x1b[31m";
                break;
            case "green":
                fgc = "\x1b[32m";
                break;
            case "yellow":
                fgc = "\x1b[33m";
                break;
            case "blue":
                fgc = "\x1b[34m";
                break;
            case "magenta":
                fgc = "\x1b[35m";
                break;
            case "cyan":
                fgc = "\x1b[36m";
                break;
            case "white":
                fgc = "\x1b[37m";
                break;
        }

        let bgc = "";

        switch (backgroundColor.trim().toLowerCase()) {
            case "black":
                bgc = "\x1b[40m";
                break;
            case "red":
                bgc = "\x1b[41m";
                break;
            case "green":
                bgc = "\x1b[42m";
                break;
            case "yellow":
                bgc = "\x1b[43m";
                break;
            case "blue":
                bgc = "\x1b[44m";
                break;
            case "magenta":
                bgc = "\x1b[45m";
                break;
            case "cyan":
                bgc = "\x1b[46m";
                break;
            case "white":
                bgc = "\x1b[47m";
                break;
        }

        return `${fgc}${bgc}`;
    }

    private getColorReset(): string {
        return "\x1b[0m";
    }

    /**
     * Print one line composed of independently colored segments.
     *
     * @example
     * print([{ value: "[ok]", fg: "green" }, { value: " done", fg: "white" }])
     */
    print(segments: PrintSegment[]): void;
    /**
     * Print one line with a single foreground/background for all strings.
     *
     * @example
     * print("white", "black", "hello")
     */
    print(foregroundColor?: string, backgroundColor?: string, ...strings: unknown[]): void;
    print(
        foregroundColorOrSegments: string | PrintSegment[] = "white",
        backgroundColor: string = "black",
        ...strings: unknown[]
    ): void {
        if (Array.isArray(foregroundColorOrSegments)) {
            this.printSegments(foregroundColorOrSegments);

            return;
        }

        const c = this.getColor(foregroundColorOrSegments, backgroundColor);
        const text = strings.map((item) => stringifySegment(item)).join("");

        console.log(`${c}${text}${this.getColorReset()}`);

        if (this.closeByNewLine) {
            console.log("");
        }
    }

    private printSegments(segments: PrintSegment[]): void {
        const line = segments
            .map((segment) => {
                const c = this.getColor(segment.fg ?? "white", segment.bg ?? "");

                return `${c}${stringifySegment(segment.value)}${this.getColorReset()}`;
            })
            .join("");

        console.log(line);

        if (this.closeByNewLine) {
            console.log("");
        }
    }

    clear(): void {
        console.clear();
    }

    log(...strings: unknown[]): void {
        const fg = "white";
        const bg = "";
        const groupTile = ` ${this.logsTitle}`;

        if (strings.length > 1) {
            const c = this.getColor(fg, bg);

            console.group(c, groupTile);

            const nl = this.closeByNewLine;
            this.closeByNewLine = false;

            strings.forEach((item) => {
                this.print(fg, bg, item);
            });

            this.closeByNewLine = nl;
            console.groupEnd();

            if (nl) {
                console.log();
            }
        } else {
            this.print(fg, bg, ...strings);
        }
    }

    warn(...strings: unknown[]): void {
        const fg = "yellow";
        const bg = "";
        const groupTile = ` ${this.warningsTitle}`;

        if (strings.length > 1) {
            const c = this.getColor(fg, bg);

            console.group(c, groupTile);

            const nl = this.closeByNewLine;
            this.closeByNewLine = false;

            strings.forEach((item) => {
                this.print(fg, bg, item);
            });

            this.closeByNewLine = nl;
            console.groupEnd();

            if (nl) {
                console.log();
            }
        } else {
            this.print(fg, bg, ...strings);
        }
    }

    error(...strings: unknown[]): void {
        const fg = "red";
        const bg = "";
        const groupTile = ` ${this.errorsTitle}`;

        if (strings.length > 1) {
            const c = this.getColor(fg, bg);

            console.group(c, groupTile);

            const nl = this.closeByNewLine;
            this.closeByNewLine = false;

            strings.forEach((item) => {
                this.print(fg, bg, item);
            });

            this.closeByNewLine = nl;
            console.groupEnd();

            if (nl) {
                console.log();
            }
        } else {
            this.print(fg, bg, ...strings);
        }
    }

    info(...strings: unknown[]): void {
        const fg = "blue";
        const bg = "";
        const groupTile = ` ${this.informationsTitle}`;

        if (strings.length > 1) {
            const c = this.getColor(fg, bg);

            console.group(c, groupTile);

            const nl = this.closeByNewLine;
            this.closeByNewLine = false;

            strings.forEach((item) => {
                this.print(fg, bg, item);
            });

            this.closeByNewLine = nl;
            console.groupEnd();

            if (nl) {
                console.log();
            }
        } else {
            this.print(fg, bg, ...strings);
        }
    }

    success(...strings: unknown[]): void {
        const fg = "green";
        const bg = "";
        const groupTile = ` ${this.successesTitle}`;

        if (strings.length > 1) {
            const c = this.getColor(fg, bg);

            console.group(c, groupTile);

            const nl = this.closeByNewLine;
            this.closeByNewLine = false;

            strings.forEach((item) => {
                this.print(fg, bg, item);
            });

            this.closeByNewLine = nl;
            console.groupEnd();

            if (nl) {
                console.log();
            }
        } else {
            this.print(fg, bg, ...strings);
        }
    }

    debug(...strings: unknown[]): void {
        const fg = "magenta";
        const bg = "";
        const groupTile = ` ${this.debugsTitle}`;

        if (strings.length > 1) {
            const c = this.getColor(fg, bg);

            console.group(c, groupTile);

            const nl = this.closeByNewLine;
            this.closeByNewLine = false;

            strings.forEach((item) => {
                this.print(fg, bg, item);
            });

            this.closeByNewLine = nl;
            console.groupEnd();

            if (nl) {
                console.log();
            }
        } else {
            this.print(fg, bg, ...strings);
        }
    }

    assert(...strings: unknown[]): void {
        const fg = "cyan";
        const bg = "";
        const groupTile = ` ${this.assertsTitle}`;

        if (strings.length > 1) {
            const c = this.getColor(fg, bg);

            console.group(c, groupTile);

            const nl = this.closeByNewLine;
            this.closeByNewLine = false;

            strings.forEach((item) => {
                this.print(fg, bg, item);
            });

            this.closeByNewLine = nl;
            console.groupEnd();

            if (nl) {
                console.log();
            }
        } else {
            this.print(fg, bg, ...strings);
        }
    }
}
