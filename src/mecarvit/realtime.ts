export type CadastroRealtimePayload = {
    kind: "cadastro";
    entity: string;
    actorNome: string;
    actorCpf: string;
    label: string;
};

export function isCadastroRealtimePayload(value: unknown): value is CadastroRealtimePayload {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const record = value as Record<string, unknown>;

    return (
        record.kind === "cadastro" &&
        typeof record.entity === "string" &&
        typeof record.actorNome === "string" &&
        typeof record.actorCpf === "string" &&
        typeof record.label === "string"
    );
}

export const CADASTRO_ENTITY_LABEL: Record<string, string> = {
    cliente: "um cliente",
    veiculo: "um veículo",
    usuario: "um funcionário",
    servico: "um serviço",
    cargo: "um cargo",
    endereco: "um endereço"
};
