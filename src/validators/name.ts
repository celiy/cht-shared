import type { ApiErrorFields } from "../errors/ApiError";

export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 120;
export const NAME_REGEX = /^[\p{L} .'-]+$/u;

/**
 * Validates a person's name (letters, spaces, dots, apostrophes and hyphens).
 * Returns an error message or null when valid.
 */
export function validateName(name: string, required = true): string | null {
    if (typeof name !== "string" || name.trim().length === 0) {
        return required ? "Nome é obrigatório" : null;
    }

    const trimmed = name.trim();

    if (trimmed.length < NAME_MIN_LENGTH) {
        return `Nome deve ter pelo menos ${NAME_MIN_LENGTH} caracteres`;
    }

    if (trimmed.length > NAME_MAX_LENGTH) {
        return `Nome deve ter no máximo ${NAME_MAX_LENGTH} caracteres`;
    }

    if (!NAME_REGEX.test(trimmed)) {
        return "O nome tem caracteres inválidos";
    }

    return null;
}

export function collectNameError(
    fields: ApiErrorFields,
    name: string | undefined,
    key = "nome"
): void {
    const error = validateName(name ?? "");

    if (error) {
        fields[key] = error;
    }
}
