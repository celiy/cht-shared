/**
 * Parses monetary values from CHT money Input (digits-only = cents) or decimal strings using `.` or `,`.
 */
export function parseMoneyInput(value: unknown): number | null {
    if (value === null || value === undefined) {
        return null;
    }

    if (typeof value === "number") {
        return Number.isFinite(value) ? value : null;
    }

    const raw = String(value).trim();

    if (raw === "") {
        return null;
    }

    if (/[,.]/.test(raw)) {
        return parseMoneyDecimalString(raw);
    }

    const digits = raw.replace(/\D/g, "");

    if (digits === "") {
        return null;
    }

    const amount = Number(digits) / 100;

    return Number.isFinite(amount) ? amount : null;
}

/**
 * Parses amounts already stored in reais (API, list rows), not cent digits from money Input.
 */
export function parseStoredMoneyAmount(value: unknown): number | null {
    if (value === null || value === undefined) {
        return null;
    }

    if (typeof value === "number") {
        return Number.isFinite(value) ? value : null;
    }

    const raw = String(value).trim();

    if (raw === "") {
        return null;
    }

    if (/[,.]/.test(raw)) {
        return parseMoneyDecimalString(raw);
    }

    const amount = Number(raw);

    return Number.isFinite(amount) ? amount : null;
}

function parseMoneyDecimalString(raw: string): number | null {
    let normalized = raw.replace(/\s/g, "").replace(/R\$/gi, "");

    const lastComma = normalized.lastIndexOf(",");
    const lastDot = normalized.lastIndexOf(".");

    if (lastComma !== -1 && lastDot !== -1) {
        if (lastComma > lastDot) {
            normalized = normalized.replace(/\./g, "").replace(",", ".");
        } else {
            normalized = normalized.replace(/,/g, "");
        }
    } else if (lastComma !== -1) {
        normalized = normalized.replace(",", ".");
    }

    const amount = Number(normalized);

    return Number.isFinite(amount) ? amount : null;
}

/** Encodes a monetary amount as digit-only cents for `Input` type `money`. */
export function moneyAmountToInputDigits(amount: number): string {
    if (!Number.isFinite(amount)) {
        return "";
    }

    const cents = Math.round(amount * 100);

    return String(Math.max(0, cents));
}
