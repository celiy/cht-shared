import type { ApiErrorFields } from "../errors/ApiError";
import validateEmail from "./email";

type LoginDTO = {
    email: string;
    password?: string;
    senha?: string;
    empresaId?: number;
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
 * Accepts `senha` (TCC/Mecarvit) or `password` (legacy).
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

const SYSTEM_OWNER_LOGIN_PATTERN = /^[a-zA-Z0-9._@+-]+$/;

type SystemOwnerDTO = {
    login?: string;
    senha?: string;
    password?: string;
};

/**
 * Validate system-owner setup/login payload (desktop installer / first run).
 */
export function validateSystemOwnerCredentials(dto: Partial<SystemOwnerDTO>): ApiErrorFields | null {
    const fields: ApiErrorFields = {};
    const login = String(dto.login ?? "").trim();
    const senha = dto.senha ?? dto.password ?? "";

    if (login.length < 3 || login.length > 80 || !SYSTEM_OWNER_LOGIN_PATTERN.test(login)) {
        fields.login = "Login deve ter entre 3 e 80 caracteres (letras, números ou . _ @ + -)";
    }

    const passwordError = validatePasswordField(senha);

    if (passwordError) {
        fields.senha = passwordError;
    } else if (senha.length < 8) {
        fields.senha = "Senha deve ter pelo menos 8 caracteres";
    }

    return Object.keys(fields).length > 0 ? fields : null;
}
