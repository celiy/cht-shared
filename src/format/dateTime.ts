/**
 * Date time
 * This file is used to format date and time.
 */

/**
 * Date millis
 * @param {unknown} value The value to get the millis from.
 * @returns {number | null} The millis.
 */
function dateMillis(value: unknown): number | null {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    const date = value instanceof Date ? value : new Date(String(value));
    const millis = date.getTime();

    return Number.isNaN(millis) ? null : millis;
}

/**
 * Most recent of create/update timestamps (update wins when strictly later).
 * @param {unknown[]} values The values to get the latest date from.
 * @returns {unknown} The latest date.
 */
export function latestDateValue(...values: unknown[]): unknown {
    let latest: unknown;
    let latestMillis = Number.NEGATIVE_INFINITY;

    for (const value of values) {
        const millis = dateMillis(value);

        if (millis == null || millis < latestMillis) {
            continue;
        }

        latestMillis = millis;
        latest = value;
    }

    return latest;
}

/**
 * Format date time br
 * @param {unknown} value The value to format.
 * @returns {string} The formatted date time.
 */
export function formatDateTimeBr(value: unknown): string {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    const date = value instanceof Date ? value : new Date(String(value));

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} - ${hours}:${minutes}`;
}

/**
 * Format date input value
 * @param {unknown} value The value to format.
 * @returns {string} The formatted date input value.
 */
export function formatDateInputValue(value: unknown): string {
    if (value === null || value === undefined || value === "") {
        return "";
    }

    const date = value instanceof Date ? value : new Date(String(value));

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${year}-${month}-${day}`;
}

/**
 * Format date br
 * @param {unknown} value The value to format.
 * @returns {string} The formatted date.
 *
 *
 * Date-only fields are stored as UTC midnight because that is what
 * `new Date("aaaa-mm-dd")` produces. Reading them back with the local getters
 * that `formatDateTimeBr` uses would shift the day by one in negative-offset
 * timezones (in UTC-3, `2026-09-20` would render as `19/09/2026`), so this
 * helper stays on the UTC basis.
 *
 * Use `formatDateTimeBr` for real instants, where the local time matters.
 */
export function formatDateBr(value: unknown): string {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    const date = value instanceof Date ? value : new Date(String(value));

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");

    return `${day}/${month}/${date.getUTCFullYear()}`;
}
