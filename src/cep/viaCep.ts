export type ViaCepAddress = {
    estado: string;
    cidade: string;
    bairro: string;
    rua: string;
};

export function cepDigits(value: unknown): string {
    return String(value ?? "").replace(/\D/g, "");
}

export function viaCepUrl(cep: string): string {
    return `https://viacep.com.br/ws/${cep}/json/`;
}

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
