/**
 * Display masks
 * This file is used to format display masks.
 */

export type TableCellMaskFormat = "documento" | "cpf" | "cnpj" | "phone" | "cep";

/**
 * Digits only
 * @param {string} value The value to get the digits from.
 * @returns {string} The digits.
 */
function digitsOnly(value: string): string {
    return value.replace(/\D/g, "");
}

/**
 * Mask cpf display
 * @param {string} value The value to mask.
 * @returns {string} The masked value.
 */
export function maskCpfDisplay(value: string): string {
    const digits = digitsOnly(value);

    if (digits.length !== 11) {
        return value.trim() ? "***" : "—";
    }

    return `***.***.***-${digits.slice(-2)}`;
}

/**
 * Mask cnpj display
 * @param {string} value The value to mask.
 * @returns {string} The masked value.
 */
export function maskCnpjDisplay(value: string): string {
    const digits = digitsOnly(value);

    if (digits.length !== 14) {
        return value.trim() ? "***" : "—";
    }

    return `**.***.***/****-${digits.slice(-2)}`;
}

/**
 * Mask documento display
 * @param {string} value The value to mask.
 * @returns {string} The masked value.
 */
export function maskDocumentoDisplay(value: string): string {
    const digits = digitsOnly(value);

    if (digits.length === 11) {
        return maskCpfDisplay(digits);
    }

    if (digits.length === 14) {
        return maskCnpjDisplay(digits);
    }

    return value.trim() ? "***" : "—";
}

/**
 * Format cpf display
 * @param {string} value The value to format.
 * @returns {string} The formatted value.
 */
export function formatCpfDisplay(value: string): string {
    const digits = digitsOnly(value);

    if (digits.length !== 11) {
        const trimmed = value.trim();

        return trimmed || "—";
    }

    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

/**
 * Format cnpj display
 * @param {string} value The value to format.
 * @returns {string} The formatted value.
 */
export function formatCnpjDisplay(value: string): string {
    const digits = digitsOnly(value);

    if (digits.length !== 14) {
        const trimmed = value.trim();

        return trimmed || "—";
    }

    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

/**
 * Format documento display
 * @param {string} value The value to format.
 * @returns {string} The formatted value.
 */
export function formatDocumentoDisplay(value: string): string {
    const digits = digitsOnly(value);

    if (digits.length === 11) {
        return formatCpfDisplay(digits);
    }

    if (digits.length === 14) {
        return formatCnpjDisplay(digits);
    }

    const trimmed = value.trim();

    return trimmed || "—";
}

/**
 * Format phone display
 * @param {string} value The value to format.
 * @returns {string} The formatted value.
 */
export function formatPhoneDisplay(value: string): string {
    const digits = digitsOnly(value);

    if (digits.length === 10) {
        return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }

    if (digits.length === 11) {
        return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }

    const trimmed = value.trim();

    return trimmed || "—";
}

/**
 * Format cep display
 * @param {string} value The value to format.
 * @returns {string} The formatted value.
 */
export function formatCepDisplay(value: string): string {
    const digits = digitsOnly(value);

    if (digits.length !== 8) {
        const trimmed = value.trim();

        return trimmed || "—";
    }

    return digits.replace(/(\d{5})(\d{3})/, "$1-$2");
}

const FIELD_MASK_BY_NAME: Record<string, TableCellMaskFormat> = {
    documento: "documento",
    clienteDocumento: "documento",
    cpf: "cpf",
    cel: "phone",
    telefone: "phone",
    phone: "phone",
    cep: "cep"
};

/**
 * Table cell mask for field
 * @param {string | undefined} field The field to get the mask for.
 * @returns {TableCellMaskFormat | undefined} The mask.
 */
export function tableCellMaskForField(field: string | undefined): TableCellMaskFormat | undefined {
    if (!field) {
        return undefined;
    }

    return FIELD_MASK_BY_NAME[field];
}

/**
 * Format table cell mask
 * @param {string} value The value to format.
 * @param {TableCellMaskFormat} format The format to use.
 * @returns {string} The formatted value.
 */
export function formatTableCellMask(value: string, format: TableCellMaskFormat): string {
    switch (format) {
        case "documento":
            return formatDocumentoDisplay(value);
        case "cpf":
            return formatCpfDisplay(value);
        case "cnpj":
            return formatCnpjDisplay(value);
        case "phone":
            return formatPhoneDisplay(value);
        case "cep":
            return formatCepDisplay(value);
        default:
            return value;
    }
}
