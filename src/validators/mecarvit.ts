import type { ApiErrorFields } from "../errors/ApiError";
import { validateCPF, validateDocumento } from "./documents";
import validateEmail from "./email";
import { validateName } from "./name";
import validatePassword, { PASSWORD_MIN_LENGTH } from "./password";

const TEXT_MAX = 5000;
const ACCESS_DIGITS = new Set(["1", "2", "3", "4", "5", "6"]);
const RES_TIPOS = new Set(["entrada", "saida"]);
const PAGAMENTO_TIPOS = new Set([
    "dinheiro",
    "credito",
    "crédito",
    "debito",
    "débito",
    "pix",
    "boleto",
    "transferencia",
    "transferência",
    "cheque",
    "outro"
]);

function isBlank(value: unknown): boolean {
    return typeof value !== "string" || value.trim().length === 0;
}

function asRecord(value: unknown): Record<string, unknown> | null {
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        return value as Record<string, unknown>;
    }

    return null;
}

function emailError(email: string, required = true): string | null {
    if (isBlank(email)) {
        return required ? "Email é obrigatório" : null;
    }

    if (!validateEmail(email.trim())) {
        return "Email inválido";
    }

    return null;
}

function senhaError(senha: string, required = true): string | null {
    if (typeof senha !== "string" || senha.length === 0) {
        return required ? "Senha é obrigatória" : null;
    }

    if (!validatePassword(senha)) {
        return `Senha deve ter entre ${PASSWORD_MIN_LENGTH} e 128 caracteres`;
    }

    return null;
}

function cpfError(cpf: string, required = true): string | null {
    if (isBlank(cpf)) {
        return required ? "CPF é obrigatório" : null;
    }

    if (!validateCPF(cpf)) {
        return "CPF inválido";
    }

    return null;
}

function documentoError(documento: string, required = true): string | null {
    if (isBlank(documento)) {
        return required ? "Documento é obrigatório" : null;
    }

    if (!validateDocumento(documento)) {
        return "Documento deve ser um CPF ou CNPJ válido";
    }

    return null;
}

function nivelAcessoError(value: unknown, { allowZero }: { allowZero: boolean }): string | null {
    if (value === undefined || value === null || value === "") {
        return "nivelAcesso é obrigatório";
    }

    const raw = String(value).trim();

    if (raw === "0") {
        return allowZero ? null : "nivelAcesso 0 é exclusivo do gestor fundador";
    }

    if (!/^[1-6]+$/.test(raw)) {
        return "nivelAcesso deve ser a concatenação dos dígitos 1 a 6";
    }

    const seen = new Set<string>();

    for (const digit of raw) {
        if (!ACCESS_DIGITS.has(digit)) {
            return "nivelAcesso contém dígito inválido";
        }

        if (seen.has(digit)) {
            return "nivelAcesso não pode repetir dígitos";
        }

        seen.add(digit);
    }

    return null;
}

function positiveIntError(value: unknown, label: string, required = true): string | null {
    if (value === undefined || value === null || value === "") {
        return required ? `${label} é obrigatório` : null;
    }

    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed <= 0) {
        return `${label} deve ser um inteiro positivo`;
    }

    return null;
}

function moneyError(value: unknown, label: string, required = true): string | null {
    if (value === undefined || value === null || value === "") {
        return required ? `${label} é obrigatório` : null;
    }

    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed < 0) {
        return `${label} deve ser um número maior ou igual a zero`;
    }

    return null;
}

function tooLong(value: string, max = TEXT_MAX): boolean {
    return value.length > max;
}

function emptyToNull(fields: ApiErrorFields): ApiErrorFields | null {
    return Object.keys(fields).length > 0 ? fields : null;
}

export function validateCadastro(dto: Record<string, unknown>): ApiErrorFields | null {
    const fields: ApiErrorFields = {};
    const empresa = asRecord(dto.empresa);
    const usuario = asRecord(dto.usuario);

    if (!empresa) {
        fields.empresa = "Empresa é obrigatória";
    } else if (isBlank(empresa.nome as string | undefined)) {
        fields["empresa.nome"] = "Nome da empresa é obrigatório";
    } else if (tooLong(String(empresa.nome).trim(), 180)) {
        fields["empresa.nome"] = "Nome da empresa é longo demais";
    }

    if (!usuario) {
        fields.usuario = "Usuário é obrigatório";
    } else {
        const cpf = cpfError(String(usuario.cpf ?? ""));

        if (cpf) {
            fields["usuario.cpf"] = cpf;
        }

        const nome = validateName(String(usuario.nome ?? ""));

        if (nome) {
            fields["usuario.nome"] = nome;
        }

        const email = emailError(String(usuario.email ?? ""));

        if (email) {
            fields["usuario.email"] = email;
        }

        const senha = senhaError(String(usuario.senha ?? usuario.password ?? ""));

        if (senha) {
            fields["usuario.senha"] = senha;
        }
    }

    return emptyToNull(fields);
}

export function validateCreateUsuario(
    dto: Record<string, unknown>,
    options: { senhaRequired: boolean }
): ApiErrorFields | null {
    const fields: ApiErrorFields = {};
    const cpf = cpfError(String(dto.cpf ?? ""));

    if (cpf) {
        fields.cpf = cpf;
    }

    const nome = validateName(String(dto.nome ?? ""));

    if (nome) {
        fields.nome = nome;
    }

    const email = emailError(String(dto.email ?? ""));

    if (email) {
        fields.email = email;
    }

    if (options.senhaRequired || dto.senha !== undefined) {
        const senha = senhaError(String(dto.senha ?? ""), options.senhaRequired);

        if (senha) {
            fields.senha = senha;
        }
    }

    const cargo = positiveIntError(dto.cargoId, "cargoId");

    if (cargo) {
        fields.cargoId = cargo;
    }

    return emptyToNull(fields);
}

export function validateUpdateUsuario(dto: Record<string, unknown>): ApiErrorFields | null {
    const fields: ApiErrorFields = {};

    if (dto.cpf !== undefined) {
        fields.cpf = "CPF não pode ser alterado";
    }

    if (dto.nome !== undefined) {
        const nome = validateName(String(dto.nome ?? ""));

        if (nome) {
            fields.nome = nome;
        }
    }

    if (dto.email !== undefined) {
        const email = emailError(String(dto.email ?? ""));

        if (email) {
            fields.email = email;
        }
    }

    if (dto.senha !== undefined) {
        const senha = senhaError(String(dto.senha ?? ""));

        if (senha) {
            fields.senha = senha;
        }
    }

    if (dto.cargoId !== undefined) {
        const cargo = positiveIntError(dto.cargoId, "cargoId");

        if (cargo) {
            fields.cargoId = cargo;
        }
    }

    if (dto.ativo !== undefined && typeof dto.ativo !== "boolean") {
        fields.ativo = "ativo deve ser booleano";
    }

    return emptyToNull(fields);
}

export function validateChangeSenha(dto: Record<string, unknown>): ApiErrorFields | null {
    const fields: ApiErrorFields = {};
    const atual = senhaError(String(dto.senhaAtual ?? ""));
    const nova = senhaError(String(dto.senhaNova ?? ""));

    if (atual) {
        fields.senhaAtual = atual;
    }

    if (nova) {
        fields.senhaNova = nova;
    }

    return emptyToNull(fields);
}

export function validateCargo(
    dto: Record<string, unknown>,
    options: { partial: boolean; allowZero: boolean }
): ApiErrorFields | null {
    const fields: ApiErrorFields = {};

    if (!options.partial || dto.nome !== undefined) {
        if (isBlank(dto.nome as string | undefined)) {
            fields.nome = "Nome é obrigatório";
        } else if (tooLong(String(dto.nome).trim(), 120)) {
            fields.nome = "Nome é longo demais";
        }
    }

    if (!options.partial || dto.nivelAcesso !== undefined) {
        const nivel = nivelAcessoError(dto.nivelAcesso, { allowZero: options.allowZero });

        if (nivel) {
            fields.nivelAcesso = nivel;
        }
    }

    return emptyToNull(fields);
}

export function validateEmpresa(dto: Record<string, unknown>, partial: boolean): ApiErrorFields | null {
    const fields: ApiErrorFields = {};

    if (!partial || dto.nome !== undefined) {
        if (isBlank(dto.nome as string | undefined)) {
            fields.nome = "Nome é obrigatório";
        } else if (tooLong(String(dto.nome).trim(), 180)) {
            fields.nome = "Nome é longo demais";
        }
    }

    return emptyToNull(fields);
}

export function validateEndereco(
    dto: Record<string, unknown>,
    prefix: string
): ApiErrorFields {
    const fields: ApiErrorFields = {};
    const required = ["estado", "cidade", "cep", "bairro", "rua", "complemento"] as const;

    for (const key of required) {
        if (isBlank(dto[key] as string | undefined)) {
            fields[`${prefix}${key}`] = `${key} é obrigatório`;
        } else if (tooLong(String(dto[key]).trim(), 180)) {
            fields[`${prefix}${key}`] = `${key} é longo demais`;
        }
    }

    const numero = Number(dto.numero);

    if (!Number.isInteger(numero) || numero < 0) {
        fields[`${prefix}numero`] = "numero deve ser um inteiro maior ou igual a zero";
    }

    return fields;
}

export function validateVeiculo(
    dto: Record<string, unknown>,
    options: { partial: boolean; requireCliente: boolean }
): ApiErrorFields | null {
    const fields: ApiErrorFields = {};

    if (!options.partial || dto.modelo !== undefined) {
        if (isBlank(dto.modelo as string | undefined)) {
            fields.modelo = "Modelo é obrigatório";
        } else if (tooLong(String(dto.modelo).trim(), 180)) {
            fields.modelo = "Modelo é longo demais";
        }
    }

    if (!options.partial || dto.placa !== undefined) {
        if (isBlank(dto.placa as string | undefined)) {
            fields.placa = "Placa é obrigatória";
        } else if (tooLong(String(dto.placa).trim(), 12)) {
            fields.placa = "Placa é longa demais";
        }
    }

    if (options.requireCliente && (!options.partial || dto.clienteDocumento !== undefined)) {
        const doc = documentoError(String(dto.clienteDocumento ?? ""));

        if (doc) {
            fields.clienteDocumento = doc;
        }
    }

    if (dto.kilometragem !== undefined && dto.kilometragem !== null && dto.kilometragem !== "") {
        const km = Number(dto.kilometragem);

        if (!Number.isFinite(km) || km < 0) {
            fields.kilometragem = "Kilometragem deve ser um número maior ou igual a zero";
        }
    }

    return emptyToNull(fields);
}

export function validateCliente(
    dto: Record<string, unknown>,
    options: { partial: boolean }
): ApiErrorFields | null {
    const fields: ApiErrorFields = {};

    if (!options.partial || dto.documento !== undefined) {
        const doc = documentoError(String(dto.documento ?? ""));

        if (doc) {
            fields.documento = doc;
        }
    }

    if (!options.partial || dto.nome !== undefined) {
        if (isBlank(dto.nome as string | undefined)) {
            fields.nome = "Nome é obrigatório";
        } else if (tooLong(String(dto.nome).trim(), 180)) {
            fields.nome = "Nome é longo demais";
        }
    }

    if (dto.email !== undefined && dto.email !== null && String(dto.email).trim() !== "") {
        const email = emailError(String(dto.email), false);

        if (email) {
            fields.email = email;
        }
    }

    if (Array.isArray(dto.enderecos)) {
        dto.enderecos.forEach((item, index) => {
            const record = asRecord(item);

            if (!record) {
                fields[`enderecos.${index}`] = "Endereço inválido";
                return;
            }

            Object.assign(fields, validateEndereco(record, `enderecos.${index}.`));
        });
    }

    if (Array.isArray(dto.veiculos)) {
        dto.veiculos.forEach((item, index) => {
            const record = asRecord(item);

            if (!record) {
                fields[`veiculos.${index}`] = "Veículo inválido";
                return;
            }

            const nested = validateVeiculo(record, { partial: false, requireCliente: false });

            if (nested) {
                for (const [key, value] of Object.entries(nested)) {
                    fields[`veiculos.${index}.${key}`] = value;
                }
            }
        });
    }

    return emptyToNull(fields);
}

export function validateServico(dto: Record<string, unknown>, partial: boolean): ApiErrorFields | null {
    const fields: ApiErrorFields = {};

    if (!partial || dto.nome !== undefined) {
        if (isBlank(dto.nome as string | undefined)) {
            fields.nome = "Nome é obrigatório";
        } else if (tooLong(String(dto.nome).trim(), 180)) {
            fields.nome = "Nome é longo demais";
        }
    }

    return emptyToNull(fields);
}

export function validateItemServico(
    dto: Record<string, unknown>,
    prefix: string
): ApiErrorFields {
    const fields: ApiErrorFields = {};
    const servicoId = positiveIntError(dto.servicoId, "servicoId");
    const quantidade = positiveIntError(dto.quantidade, "quantidade");
    const valorObra = moneyError(dto.valorObra, "valorObra");

    if (servicoId) {
        fields[`${prefix}servicoId`] = servicoId;
    }

    if (quantidade) {
        fields[`${prefix}quantidade`] = quantidade;
    }

    if (valorObra) {
        fields[`${prefix}valorObra`] = valorObra;
    }

    if (dto.valorPecas !== undefined && dto.valorPecas !== null && dto.valorPecas !== "") {
        const pecas = moneyError(dto.valorPecas, "valorPecas", false);

        if (pecas) {
            fields[`${prefix}valorPecas`] = pecas;
        }
    }

    return fields;
}

export function validatePagamento(
    dto: Record<string, unknown>,
    prefix: string
): ApiErrorFields {
    const fields: ApiErrorFields = {};

    if (isBlank(dto.tipo as string | undefined)) {
        fields[`${prefix}tipo`] = "tipo é obrigatório";
    } else if (!PAGAMENTO_TIPOS.has(String(dto.tipo).trim().toLowerCase())) {
        fields[`${prefix}tipo`] = "tipo de pagamento inválido";
    }

    const valor = moneyError(dto.valor, "valor");

    if (valor) {
        fields[`${prefix}valor`] = valor;
    } else if (Number(dto.valor) <= 0) {
        fields[`${prefix}valor`] = "valor deve ser maior que zero";
    }

    return fields;
}

export function validateOrdemServico(
    dto: Record<string, unknown>,
    options: { partial: boolean }
): ApiErrorFields | null {
    const fields: ApiErrorFields = {};

    if (!options.partial || dto.clienteDocumento !== undefined) {
        const doc = documentoError(String(dto.clienteDocumento ?? ""));

        if (doc) {
            fields.clienteDocumento = doc;
        }
    }

    if (!options.partial || dto.veiculoId !== undefined) {
        const veiculo = positiveIntError(dto.veiculoId, "veiculoId");

        if (veiculo) {
            fields.veiculoId = veiculo;
        }
    }

    if (dto.statusOsId !== undefined) {
        const status = positiveIntError(dto.statusOsId, "statusOsId");

        if (status) {
            fields.statusOsId = status;
        }
    }

    if (Array.isArray(dto.itens)) {
        dto.itens.forEach((item, index) => {
            const record = asRecord(item);

            if (!record) {
                fields[`itens.${index}`] = "Item inválido";
                return;
            }

            Object.assign(fields, validateItemServico(record, `itens.${index}.`));
        });
    }

    if (Array.isArray(dto.responsaveis)) {
        dto.responsaveis.forEach((item, index) => {
            const cpf = typeof item === "string" ? item : asRecord(item)?.cpf;
            const error = cpfError(String(cpf ?? ""));

            if (error) {
                fields[`responsaveis.${index}`] = error;
            }
        });
    }

    if (Array.isArray(dto.pagamentos)) {
        dto.pagamentos.forEach((item, index) => {
            const record = asRecord(item);

            if (!record) {
                fields[`pagamentos.${index}`] = "Pagamento inválido";
                return;
            }

            Object.assign(fields, validatePagamento(record, `pagamentos.${index}.`));
        });
    }

    return emptyToNull(fields);
}

export function validateRegEntradaSaida(
    dto: Record<string, unknown>,
    options: { partial: boolean }
): ApiErrorFields | null {
    const fields: ApiErrorFields = {};

    if (!options.partial || dto.tipo !== undefined) {
        if (isBlank(dto.tipo as string | undefined)) {
            fields.tipo = "tipo é obrigatório";
        } else if (!RES_TIPOS.has(String(dto.tipo).trim().toLowerCase())) {
            fields.tipo = "tipo deve ser entrada ou saida";
        }
    }

    if (!options.partial || dto.nome !== undefined) {
        if (isBlank(dto.nome as string | undefined)) {
            fields.nome = "Nome é obrigatório";
        } else if (tooLong(String(dto.nome).trim(), 180)) {
            fields.nome = "Nome é longo demais";
        }
    }

    if (!options.partial || dto.valor !== undefined) {
        const valor = moneyError(dto.valor, "valor");

        if (valor) {
            fields.valor = valor;
        }
    }

    if (Array.isArray(dto.pagamentos)) {
        dto.pagamentos.forEach((item, index) => {
            const record = asRecord(item);

            if (!record) {
                fields[`pagamentos.${index}`] = "Pagamento inválido";
                return;
            }

            Object.assign(fields, validatePagamento(record, `pagamentos.${index}.`));
        });
    }

    return emptyToNull(fields);
}

export function digitsOnly(value: string): string {
    return value.replace(/[^\d]+/g, "");
}
