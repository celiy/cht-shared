export const DEFAULT_DELAY = 250;

/**
 * @param {unknown} delay
 * @returns {number}
 */
export function resolveShowDelay(delay) {
    if (typeof delay !== "number" || !Number.isFinite(delay)) {
        return DEFAULT_DELAY;
    }

    return Math.max(0, delay);
}
