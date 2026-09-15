/**
 * Builds a query string from a key/value map, without a leading `?`.
 * Empty, null, and undefined values are skipped. Arrays are joined with commas.
 */
export function toQueryString(params: Record<string, unknown>): string {
    const parts: string[] = [];

    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null || value === "") {
            continue;
        }

        let serialized: string;

        if (Array.isArray(value)) {
            serialized = value
                .filter((item) => item !== undefined && item !== null && item !== "")
                .map((item) => String(item))
                .join(",");

            if (!serialized) {
                continue;
            }
        } else {
            serialized = String(value);
        }

        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(serialized)}`);
    }

    return parts.join("&");
}
