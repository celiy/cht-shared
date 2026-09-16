export type TableCellMaskFormat = "documento" | "cpf" | "cnpj" | "phone" | "cep";

function digitsOnly(value: string): string {
    return value.replace(/\D/g, "");
}

export function formatCpfDisplay(value: string): string {
    const digits = digitsOnly(value);

    if (digits.length !== 11) {
        const trimmed = value.trim();

        return trimmed || "—";
    }

    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatCnpjDisplay(value: string): string {
    const digits = digitsOnly(value);

    if (digits.length !== 14) {
        const trimmed = value.trim();

        return trimmed || "—";
    }

    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

/** CPF (11) or CNPJ (14), same rules as document inputs. */
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

/** Brazilian phone; matches Input mask `(##) #########`. */
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

export function tableCellMaskForField(field: string | undefined): TableCellMaskFormat | undefined {
    if (!field) {
        return undefined;
    }

    return FIELD_MASK_BY_NAME[field];
}

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
