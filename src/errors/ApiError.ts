/**
 * Contrato da resposta de erro da API. É a mesma shape que o FormHandler do
 * front-end lê para distribuir mensagens por campo via @errors.
 *
 *   { status: 400, error: { message: "Validação falhou", fields: { email: "Email já cadastrado" } } }
 */

export interface ApiErrorFields {
    [fieldId: string]: string;
}

export interface ApiErrorEmpresaOption {
    id: number;
    nome: string;
}

export interface ApiErrorBody {
    message: string;
    fields?: ApiErrorFields;
    empresas?: ApiErrorEmpresaOption[];
}

export interface ApiErrorResponse {
    status: number;
    error: ApiErrorBody;
}
