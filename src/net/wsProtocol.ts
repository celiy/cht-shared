export const WS_DEFAULT_PATH = "/ws";
export const WS_MAX_MESSAGE_BYTES = 64 * 1024;

const TOPIC_PATTERN = /^[a-zA-Z0-9:_-]{1,128}$/;

export type WsClientMessage = { op: "auth"; token: string } | { op: "ping" };

export type WsServerMessage =
    | { op: "ready"; topics: string[] }
    | { op: "event"; topic: string; payload: unknown }
    | { op: "pong" }
    | { op: "error"; code: string; message: string };

export type WsMessage = WsClientMessage | WsServerMessage;

export function isValidWsTopic(topic: string): boolean {
    return TOPIC_PATTERN.test(topic);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseWsMessage(raw: string): WsMessage | null {
    if (raw.length > WS_MAX_MESSAGE_BYTES) {
        return null;
    }

    let parsed: unknown;

    try {
        parsed = JSON.parse(raw);
    } catch {
        return null;
    }

    if (!isRecord(parsed) || typeof parsed.op !== "string") {
        return null;
    }

    switch (parsed.op) {
        case "auth": {
            if (typeof parsed.token !== "string" || parsed.token.length === 0) {
                return null;
            }

            return { op: "auth", token: parsed.token };
        }

        case "ping":
            return { op: "ping" };

        case "pong":
            return { op: "pong" };

        case "ready": {
            if (!Array.isArray(parsed.topics) || !parsed.topics.every((item) => typeof item === "string")) {
                return null;
            }

            return { op: "ready", topics: parsed.topics };
        }

        case "event": {
            if (typeof parsed.topic !== "string" || !isValidWsTopic(parsed.topic)) {
                return null;
            }

            if (!("payload" in parsed)) {
                return null;
            }

            return { op: "event", topic: parsed.topic, payload: parsed.payload };
        }

        case "error": {
            if (typeof parsed.code !== "string" || typeof parsed.message !== "string") {
                return null;
            }

            return { op: "error", code: parsed.code, message: parsed.message };
        }

        default:
            return null;
    }
}

export function serializeWsMessage(message: WsMessage): string {
    return JSON.stringify(message);
}

export function httpBaseToWsUrl(httpBase: string, path = WS_DEFAULT_PATH): string {
    const url = new URL(httpBase);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.pathname = path;
    url.search = "";
    url.hash = "";

    return url.toString();
}
