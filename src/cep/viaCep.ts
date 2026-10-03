/**
 * Via CEP
 * This file is used to get the address from a CEP.
 */

export type ViaCepAddress = {
    estado: string;
    cidade: string;
    bairro: string;
    rua: string;
};

/**
 * Cep digits
 * @param {unknown} value The value to get the digits from.
 * @returns {string} The digits.
 */
export function cepDigits(value: unknown): string {
    return String(value ?? "").replace(/\D/g, "");
}

/**
 * Via cep url
 * @param {string} cep The CEP to get the address from.
 * @returns {string} The URL to the Via CEP API.
 */
export function viaCepUrl(cep: string): string {
    return `https://viacep.com.br/ws/${cep}/json/`;
}

/**
 * Parse via cep response
 * @param {unknown} payload The payload to parse.
 * @returns {ViaCepAddress | null} The parsed address.
 */
export function parseViaCepResponse(payload: unknown): ViaCepAddress | null {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        return null;
    }

    const record = payload as Record<string, unknown>;

    if (record.erro === true || record.erro === "true") {
        return null;
    }

    const estado = String(record.uf ?? "").trim();
    const cidade = String(record.localidade ?? "").trim();
    const bairro = String(record.bairro ?? "").trim();
    const rua = String(record.logradouro ?? "").trim();

    if (!estado && !cidade && !bairro && !rua) {
        return null;
    }

    return { estado, cidade, bairro, rua };
}
