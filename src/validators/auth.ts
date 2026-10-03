import type { ApiErrorFields } from "../errors/ApiError";
import validateEmail from "./email";

type LoginDTO = {
    email: string;
    password?: string;
    senha?: string;
    empresaId?: number;
};

/**
 * Validate email field
 * @param {string} email The email to validate.
 * @returns {string | null} The error message or null if the email is valid.
 */
function validateEmailField(email: string): string | null {
    if (typeof email !== "string" || email.trim().length === 0) {
        return "Email é obrigatório";
    }

    if (!validateEmail(email.trim())) {
        return "Email inválido";
    }

    return null;
}

/**
 * Validate password field
 * @param {string} password The password to validate.
 * @returns {string | null} The error message or null if the password is valid.
 */
function validatePasswordField(password: string): string | null {
    if (typeof password !== "string" || password.length === 0) {
        return "Senha é obrigatória";
    }

    return null;
}

/**
 * Validate login payload. Returns field errors or null when valid.
 * Accepts `senha` (TCC/Mecarvit) or `password` (legacy).
 * @param {Partial<LoginDTO>} dto The login payload to validate.
 * @returns {ApiErrorFields | null} The field errors or null when valid.
 */
export function validateLogin(dto: Partial<LoginDTO>): ApiErrorFields | null {
    const fields: ApiErrorFields = {};

    const emailError = validateEmailField(dto.email ?? "");

    if (emailError) {
        fields.email = emailError;
    }

    const senha = dto.senha ?? dto.password ?? "";
    const passwordError = validatePasswordField(senha);

    if (passwordError) {
        fields.senha = passwordError;
    }

    if (dto.empresaId !== undefined && dto.empresaId !== null) {
        const id = Number(dto.empresaId);

        if (!Number.isInteger(id) || id <= 0) {
            fields.empresaId = "empresaId deve ser um inteiro positivo";
        }
    }

    return Object.keys(fields).length > 0 ? fields : null;
}
