export const CHT_API_URL_PREFIX = "CHT_API_URL=";
export const DEFAULT_API_PORT_SCAN_LIMIT = 20;

export function parseChtApiUrlFromText(text: string): string | null {
    const match = text.match(/CHT_API_URL=(https?:\/\/[^\s]+)/i);

    if (!match?.[1]) {
        return null;
    }

    return match[1].replace(/\/$/, "");
}

export type ApiTarget = "dev" | "web" | "electron" | "mobile";

export function candidatePorts(startPort: number, maxOffset: number): number[] {
    const ports: number[] = [];
    const limit = Math.max(0, Math.floor(maxOffset));
    const start = Math.max(1, Math.floor(startPort));

    for (let offset = 0; offset <= limit; offset += 1) {
        ports.push(start + offset);
    }

    return ports;
}

export function isLoopbackHostname(hostname: string): boolean {
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname === "[::1]";
}

export function isLoopbackHttpUrl(value: string): boolean {
    try {
        return isLoopbackHostname(new URL(value).hostname);
    } catch {
        return false;
    }
}

export function parseUrlPort(value: string, fallback: number): number {
    try {
        const url = new URL(value);
        const parsed = Number(url.port);

        if (Number.isInteger(parsed) && parsed > 0) {
            return parsed;
        }

        return url.protocol === "https:" ? 443 : 80;
    } catch {
        return fallback;
    }
}

export function replaceUrlPort(value: string, port: number): string {
    const url = new URL(value);
    url.port = String(port);

    return url.toString();
}

export function pickApiBaseUrl(
    config: {
        api?: Partial<Record<ApiTarget, string>>;
        apiBaseUrl?: string;
    } | null | undefined,
    target: ApiTarget,
    fallback = "http://127.0.0.1:3001"
): string {
    const fromTarget = config?.api?.[target];

    if (typeof fromTarget === "string" && fromTarget.trim() !== "") {
        return fromTarget.trim();
    }

    if (typeof config?.apiBaseUrl === "string" && config.apiBaseUrl.trim() !== "") {
        return config.apiBaseUrl.trim();
    }

    return fallback;
}

export function resolveApiTarget(options: {
    electronBuild?: boolean;
    command?: "serve" | "build";
    override?: string;
}): ApiTarget {
    const override = options.override?.trim();

    if (override === "dev" || override === "web" || override === "electron" || override === "mobile") {
        return override;
    }

    if (options.electronBuild) {
        return "electron";
    }

    if (options.command === "build") {
        return "web";
    }

    return "dev";
}
