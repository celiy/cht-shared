/**
 * Permission digits stored in `cargo.nivel_acesso`.
 *
 * A cargo holds the concatenation of the digits it grants (e.g. "34" for a
 * mechanic: vehicles + service orders). `SUPERADMIN` is not combinable and
 * bypasses every check.
 */
export const ACCESS = {
    PONTO: "1",
    CLIENTES: "2",
    VEICULOS: "3",
    OS: "4",
    FUNCIONARIOS: "5",
    TERMINAL: "6",
    SUPERADMIN: "0"
} as const;

export type AccessDigit = (typeof ACCESS)[keyof typeof ACCESS];

export function isSuperadmin(nivelAcesso: string): boolean {
    return nivelAcesso.includes(ACCESS.SUPERADMIN);
}

/** Whether a cargo grants `digit`. Superadmin grants everything. */
export function hasAccess(nivelAcesso: string, digit: string): boolean {
    if (isSuperadmin(nivelAcesso)) {
        return true;
    }

    return nivelAcesso.includes(digit);
}
