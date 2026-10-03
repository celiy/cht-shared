export const CHT_API_URL_PREFIX = "CHT_API_URL=";
export const DEFAULT_API_PORT_SCAN_LIMIT = 20;

/**
 * Parse cht api url from text
 * @param {string} text The text to parse the cht api url from.
 * @returns {string | null} The cht api url.
 */
export function parseChtApiUrlFromText(text: string): string | null {
    const match = text.match(/CHT_API_URL=(https?:\/\/[^\s]+)/i);

    if (!match?.[1]) {
        return null;
    }

    return match[1].replace(/\/$/, "");
}

export type ApiTarget = "dev" | "web" | "electron" | "mobile";

/**
 * Candidate ports
 * @param {number} startPort The start port.
 * @param {number} maxOffset The max offset.
 * @returns {number[]} The candidate ports.
 */
export function candidatePorts(startPort: number, maxOffset: number): number[] {
    const ports: number[] = [];
    const limit = Math.max(0, Math.floor(maxOffset));
    const start = Math.max(1, Math.floor(startPort));

    for (let offset = 0; offset <= limit; offset += 1) {
        ports.push(start + offset);
    }

    return ports;
}

/**
 * Gets the is loopback hostname
 * @param {string} hostname The hostname to check.
 * @returns {boolean} True if the hostname is a loopback hostname.
 */
export function isLoopbackHostname(hostname: string): boolean {
    /**
     * Is loopback hostname
     * @param {string} hostname The hostname to check.
     * @returns {boolean} True if the hostname is a loopback hostname.
     */
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname === "[::1]";
}

/**
 * Gets the is loopback http url
 * @param {string} value The value to check.
 * @returns {boolean} True if the value is a loopback http url.
 */
export function isLoopbackHttpUrl(value: string): boolean {
    try {
        return isLoopbackHostname(new URL(value).hostname);
    } catch {
        return false;
    }
}

/**
 * Parse url port
 * @param {string} value The value to parse the port from.
 * @param {number} fallback The fallback port.
 * @returns {number} The parsed port.
 */
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

/**
 * Replace url port
 * @param {string} value The value to replace the port in.
 * @param {number} port The port to replace.
 * @returns {string} The replaced value.
 */
export function replaceUrlPort(value: string, port: number): string {
    const url = new URL(value);
    url.port = String(port);

    return url.toString();
}

/**
 * Pick api base url
 * @param {Partial<Record<ApiTarget, string>> | null | undefined} config The config to pick the api base url from.
 * @param {ApiTarget} target The target to pick the api base url for.
 * @param {string} fallback The fallback api base url.
 * @returns {string} The picked api base url.
 */
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

/**
 * Resolve api target
 * @param {Partial<Record<ApiTarget, string>> | null | undefined} config The config to resolve the api target from.
 * @param {boolean} electronBuild The electron build flag.
 * @param {string} command The command to resolve the api target for.
 * @param {string} override The override to resolve the api target for.
 * @returns {ApiTarget} The resolved api target.
 */
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
