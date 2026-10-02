/** Canonical OS status ids — keep in sync with `status_os` seed. */
export const OS_STATUS = {
    ABERTA: 1,
    PENDENTE: 2,
    EM_ANDAMENTO: 3,
    CONCLUIDA: 4,
    CANCELADA: 5,
    ORCAMENTO: 6,
    REABERTA: 7
} as const;

export type OsStatusId = (typeof OS_STATUS)[keyof typeof OS_STATUS];

const FORWARD: Record<number, number[]> = {
    [OS_STATUS.ORCAMENTO]: [
        OS_STATUS.ABERTA,
        OS_STATUS.PENDENTE,
        OS_STATUS.EM_ANDAMENTO,
        OS_STATUS.CANCELADA
    ],
    [OS_STATUS.ABERTA]: [OS_STATUS.PENDENTE, OS_STATUS.EM_ANDAMENTO, OS_STATUS.CANCELADA],
    [OS_STATUS.PENDENTE]: [OS_STATUS.EM_ANDAMENTO, OS_STATUS.CANCELADA],
    [OS_STATUS.EM_ANDAMENTO]: [OS_STATUS.PENDENTE, OS_STATUS.CONCLUIDA, OS_STATUS.CANCELADA],
    [OS_STATUS.CONCLUIDA]: [OS_STATUS.REABERTA],
    [OS_STATUS.CANCELADA]: [],
    [OS_STATUS.REABERTA]: [OS_STATUS.CONCLUIDA]
};

/** Statuses that may return to orçamento when there is no payment. */
const BACK_TO_ORCAMENTO = new Set<number>([
    OS_STATUS.ABERTA,
    OS_STATUS.PENDENTE,
    OS_STATUS.EM_ANDAMENTO,
    OS_STATUS.CANCELADA
]);

export function allowedOsStatusTargets(fromStatus: number, hasPayments: boolean): number[] {
    const next = [...(FORWARD[fromStatus] ?? [])];

    if (!hasPayments && BACK_TO_ORCAMENTO.has(fromStatus)) {
        next.push(OS_STATUS.ORCAMENTO);
    }

    return next;
}

export function canChangeOsStatus(
    fromStatus: number,
    toStatus: number,
    hasPayments: boolean
): boolean {
    if (fromStatus === toStatus) {
        return true;
    }

    return allowedOsStatusTargets(fromStatus, hasPayments).includes(toStatus);
}

export function osStatusChangeBlockedReason(
    fromStatus: number,
    toStatus: number,
    hasPayments: boolean
): string | null {
    if (canChangeOsStatus(fromStatus, toStatus, hasPayments)) {
        return null;
    }

    if (toStatus === OS_STATUS.ORCAMENTO && hasPayments) {
        return "Não é possível voltar para orçamento com pagamentos lançados.";
    }

    return "Essa alteração de status não é permitida.";
}
