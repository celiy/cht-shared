export const MODAL_QUERY_PARAM = "modal";

const registeredModalUrlIds = new Set<number>();
let nextModalUrlId = 1;

/**
 * Registers a Modal instance and returns its numeric id for the URL query.
 * Ids restart at 1 when no modals remain registered.
 */
export function registerModalUrlInstance(): number {
    const id = nextModalUrlId;
    nextModalUrlId += 1;
    registeredModalUrlIds.add(id);

    return id;
}

/**
 * Unregisters a Modal instance. Resets the id sequence when the registry is empty.
 */
export function releaseModalUrlInstance(id: number): void {
    registeredModalUrlIds.delete(id);

    if (registeredModalUrlIds.size === 0) {
        nextModalUrlId = 1;
    }
}

/** @internal Resets registry state (tests only). */
export function resetModalUrlIdAllocator(next = 1): void {
    registeredModalUrlIds.clear();
    nextModalUrlId = next;
}

/**
 * Parses the `modal` query value (`[1,2]`, `1,2`, or a single id).
 */
export function parseModalQueryParam(raw: string | null | undefined): number[] {
    if (raw === undefined || raw === null || raw === "") {
        return [];
    }

    const trimmed = raw.trim();
    const inner =
        trimmed.startsWith("[") && trimmed.endsWith("]")
            ? trimmed.slice(1, -1).trim()
            : trimmed;

    if (!inner) {
        return [];
    }

    const ids: number[] = [];

    for (const part of inner.split(",")) {
        const token = part.trim();

        if (!token) {
            continue;
        }

        const n = Number(token);

        if (!Number.isInteger(n) || n < 0) {
            continue;
        }

        if (!ids.includes(n)) {
            ids.push(n);
        }
    }

    return ids;
}

/**
 * Serializes modal ids for the query string (`[1,2]`).
 */
export function serializeModalQueryParam(ids: number[]): string {
    if (ids.length === 0) {
        return "";
    }

    return `[${ids.join(",")}]`;
}

export function modalQueryIncludes(ids: number[], id: number): boolean {
    return ids.includes(id);
}

export function addModalToQuery(ids: number[], id: number): number[] {
    if (ids.includes(id)) {
        return ids;
    }

    return [...ids, id];
}

export function removeModalFromQuery(ids: number[], id: number): number[] {
    return ids.filter((entry) => entry !== id);
}
