function dateMillis(value: unknown): number | null {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    const date = value instanceof Date ? value : new Date(String(value));
    const millis = date.getTime();

    return Number.isNaN(millis) ? null : millis;
}

/** Most recent of create/update timestamps (update wins when strictly later). */
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

/** `dd/mm/aaaa - hh:mm` for payment timestamps and similar UI. */
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

/** `yyyy-mm-dd` for HTML date inputs. */
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
