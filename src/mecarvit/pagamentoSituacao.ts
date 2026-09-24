export const PAGAMENTO_SITUACAO = {
    PAGO: "Pago",
    A_VENCER: "A vencer",
    NAO_PAGO: "Não pago",
    ATRASADO: "Atrasado"
} as const;

export type PagamentoSituacao = (typeof PAGAMENTO_SITUACAO)[keyof typeof PAGAMENTO_SITUACAO];

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
