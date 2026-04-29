import type { ApiErrorFields } from "../errors/ApiError";
import validateEmail from "./email";
import validatePassword, { PASSWORD_MIN_LENGTH } from "./password";

type CreateUserDTO = {
    name: string;
    email: string;
    password: string;
};

type UpdateUserDTO = Partial<CreateUserDTO>;

export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 120;
const NAME_REGEX = /^[\p{L} .'-]+$/u;

function validateName(name: string): string | null {
    if (typeof name !== "string" || name.trim().length === 0) {
        return "Nome é obrigatório";
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

function validateEmailField(email: string): string | null {
    if (typeof email !== "string" || email.trim().length === 0) {
        return "Email é obrigatório";
    }

    if (!validateEmail(email.trim())) {
        return "Email inválido";
    }

    return null;
}

function validatePasswordField(password: string): string | null {
    if (typeof password !== "string" || password.length === 0) {
        return "Senha é obrigatória";
    }

    if (!validatePassword(password)) {
        return `Senha deve ter entre ${PASSWORD_MIN_LENGTH} e 128 caracteres`;
    }

    return null;
}

/**
 * Validate the create user payload. Returns an object with the error messages
 * by field (`fields`) or `null` when everything is ok. It is the same shape as
 * the errorHandler of the backend responds in `error.fields`.
 */
export function validateCreateUser(dto: Partial<CreateUserDTO>): ApiErrorFields | null {
    const fields: ApiErrorFields = {};

    const nameError = validateName(dto.name ?? "");

    if (nameError) {
        fields.name = nameError;
    }

    const emailError = validateEmailField(dto.email ?? "");

    if (emailError) {
        fields.email = emailError;
    }

    const passwordError = validatePasswordField(dto.password ?? "");

    if (passwordError) {
        fields.password = passwordError;
    }

    return Object.keys(fields).length > 0 ? fields : null;
}

/**
 * Validate the update user payload. Only validates fields that were sent.
 */
export function validateUpdateUser(dto: UpdateUserDTO): ApiErrorFields | null {
    const fields: ApiErrorFields = {};

    if (dto.name !== undefined) {
        const nameError = validateName(dto.name);

        if (nameError) {
            fields.name = nameError;
        }
    }

    if (dto.email !== undefined) {
        const emailError = validateEmailField(dto.email);
        
        if (emailError) {
            fields.email = emailError;
        }
    }

    if (dto.password !== undefined) {
        const passwordError = validatePasswordField(dto.password);
        
        if (passwordError) {
            fields.password = passwordError;
        }
    }

    return Object.keys(fields).length > 0 ? fields : null;
}
