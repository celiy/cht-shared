export const PAGAMENTO_SITUACAO = {
    PAGO: "Pago",
    A_VENCER: "A vencer",
    NAO_PAGO: "Não pago",
    ATRASADO: "Atrasado"
} as const;

export type PagamentoSituacao = (typeof PAGAMENTO_SITUACAO)[keyof typeof PAGAMENTO_SITUACAO];

/** Stable query/filter slugs for pagamentoSituacao list filters. */
export const PAGAMENTO_SITUACAO_FILTER = {
    PAGO: "pago",
    NAO_PAGO: "nao_pago",
    A_VENCER: "a_vencer",
    ATRASADO: "atrasado"
} as const;

export type PagamentoSituacaoFilter =
    (typeof PAGAMENTO_SITUACAO_FILTER)[keyof typeof PAGAMENTO_SITUACAO_FILTER];

const PAGAMENTO_SITUACAO_BY_FILTER: Record<PagamentoSituacaoFilter, PagamentoSituacao> = {
    [PAGAMENTO_SITUACAO_FILTER.PAGO]: PAGAMENTO_SITUACAO.PAGO,
    [PAGAMENTO_SITUACAO_FILTER.NAO_PAGO]: PAGAMENTO_SITUACAO.NAO_PAGO,
    [PAGAMENTO_SITUACAO_FILTER.A_VENCER]: PAGAMENTO_SITUACAO.A_VENCER,
    [PAGAMENTO_SITUACAO_FILTER.ATRASADO]: PAGAMENTO_SITUACAO.ATRASADO
};

/**
 * Parses `?pagamentoSituacao=` (slug or display label). Empty / todos → null.
 */
export function parsePagamentoSituacaoFilter(
    raw: string | null | undefined
): PagamentoSituacao | null {
    const normalized = raw?.trim().toLowerCase();

    if (!normalized || normalized === "todos" || normalized === "todas") {
        return null;
    }

    const bySlug = PAGAMENTO_SITUACAO_BY_FILTER[normalized as PagamentoSituacaoFilter];

    if (bySlug) {
        return bySlug;
    }

    for (const situacao of Object.values(PAGAMENTO_SITUACAO)) {
        if (situacao.toLowerCase() === normalized) {
            return situacao;
        }
    }

    return null;
}

export const PAYMENT_EPSILON = 0.009;

function toDate(value: Date | string | number | null | undefined): Date | null {
    if (value == null || value === "") {
        return null;
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
}

function startOfUtcDay(date: Date): number {
    return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function isRegistroFullyPaid(valor: number, valorPago: number): boolean {
    return Number(valorPago) + PAYMENT_EPSILON >= Number(valor);
}

export function pagamentoSituacao(options: {
    valor: number;
    valorPago: number;
    dataLimitePagamento?: Date | string | number | null;
    now?: Date;
}): PagamentoSituacao {
    const valor = Number(options.valor) || 0;
    const valorPago = Number(options.valorPago) || 0;

    if (valor <= PAYMENT_EPSILON && valorPago <= PAYMENT_EPSILON) {
        return PAGAMENTO_SITUACAO.NAO_PAGO;
    }

    if (isRegistroFullyPaid(valor, valorPago)) {
        return PAGAMENTO_SITUACAO.PAGO;
    }

    const deadline = toDate(options.dataLimitePagamento);

    if (!deadline) {
        return PAGAMENTO_SITUACAO.NAO_PAGO;
    }

    const now = options.now ?? new Date();

    if (startOfUtcDay(now) > startOfUtcDay(deadline)) {
        return PAGAMENTO_SITUACAO.ATRASADO;
    }

    return PAGAMENTO_SITUACAO.A_VENCER;
}
