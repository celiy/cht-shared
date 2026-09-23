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
    resetModalUrlOpenState();
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

const openModalUrlIds = new Set<number>();
let pendingRouter: ModalUrlRouter | null = null;
let flushQueued = false;
let navGeneration = 0;

export type ModalUrlRouter = {
    push: (to: { query: Record<string, unknown> }) => Promise<unknown>;
    replace: (to: { query: Record<string, unknown> }) => Promise<unknown>;
    currentRoute: { value: { query: Record<string, unknown> } };
};

/**
 * Tracks which modal instances are open so URL sync can batch simultaneous opens.
 */
export function trackModalUrlOpenState(id: number, open: boolean): void {
    if (open) {
        openModalUrlIds.add(id);
    } else {
        openModalUrlIds.delete(id);
    }
}

/** @internal */
export function resetModalUrlOpenState(): void {
    openModalUrlIds.clear();
    pendingRouter = null;
    flushQueued = false;
    navGeneration = 0;
}

function sortedOpenModalUrlIds(): number[] {
    return [...openModalUrlIds].sort((a, b) => a - b);
}

function queryIdsFromRoute(query: Record<string, unknown>): number[] {
    const raw = query[MODAL_QUERY_PARAM];
    const text = Array.isArray(raw) ? raw[0] : raw;

    return parseModalQueryParam(typeof text === "string" ? text : undefined);
}

function buildQueryWithModalIds(
    base: Record<string, unknown>,
    ids: number[]
): Record<string, unknown> {
    const query = { ...base };

    if (ids.length === 0) {
        delete query[MODAL_QUERY_PARAM];
    } else {
        query[MODAL_QUERY_PARAM] = serializeModalQueryParam(ids);
    }

    return query;
}

function modalIdStacksEqual(a: number[], b: number[]): boolean {
    if (a.length !== b.length) {
        return false;
    }

    return a.every((value, index) => value === b[index]);
}

function shouldPushForStackGrow(routeIds: number[], desired: number[]): boolean {
    if (desired.length === 0 || desired.length <= routeIds.length) {
        return false;
    }

    for (let i = 0; i < routeIds.length; i += 1) {
        if (routeIds[i] !== desired[i]) {
            return false;
        }
    }

    return true;
}

/**
 * Coalesces modal open/close into a single router update (fixes simultaneous opens).
 */
export function scheduleModalUrlQuerySync(router: ModalUrlRouter): void {
    pendingRouter = router;

    if (flushQueued) {
        return;
    }

    flushQueued = true;
    queueMicrotask(() => {
        flushQueued = false;
        void flushModalUrlQuerySync();
    });
}

async function flushModalUrlQuerySync(): Promise<void> {
    const router = pendingRouter;

    if (!router) {
        return;
    }

    const routeQuery = router.currentRoute.value.query;
    const routeIds = queryIdsFromRoute(routeQuery);
    const desired = sortedOpenModalUrlIds();

    if (modalIdStacksEqual(routeIds, desired)) {
        return;
    }

    const query = buildQueryWithModalIds(routeQuery, desired);
    navGeneration += 1;
    const gen = navGeneration;
    const usePush = shouldPushForStackGrow(routeIds, desired);

    try {
        if (usePush) {
            await router.push({ query });
        } else {
            await router.replace({ query });
        }
    } catch {
        return;
    }

    if (gen !== navGeneration) {
        void flushModalUrlQuerySync();
    }
}
