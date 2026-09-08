import type { ApiErrorFields } from "../errors/ApiError";
import validateEmail from "./email";

type LoginDTO = {
    email: string;
    password: string;
};

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

    return null;
}

/**
 * Validate login payload. Returns field errors or null when valid.
 */
export function validateLogin(dto: Partial<LoginDTO>): ApiErrorFields | null {
    const fields: ApiErrorFields = {};

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
