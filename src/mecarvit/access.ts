/**
 * Named permission keys stored as JSON in `cargo.nivel_acesso`.
 *
 * Superadmin is a single key (`superadmin`) and bypasses every check.
 * Legacy concatenated digits (`"34"`) are still parsed so existing databases
 * keep working until they are rewritten.
 */

export const PERMISSIONS = {
    SUPERADMIN: "superadmin",
    GERENTE: "gerente",
    funcionarios: {
        ver: "funcionarios.ver",
        editar: "funcionarios.editar",
        criar: "funcionarios.criar",
        excluir: "funcionarios.excluir",
        exportar: "funcionarios.exportar",
        pii: "funcionarios.pii"
    },
    clientes: {
        ver: "clientes.ver",
        editar: "clientes.editar",
        criar: "clientes.criar",
        excluir: "clientes.excluir",
        exportar: "clientes.exportar",
        pii: "clientes.pii"
    },
    veiculos: {
        ver: "veiculos.ver",
        editar: "veiculos.editar",
        criar: "veiculos.criar",
        excluir: "veiculos.excluir",
        exportar: "veiculos.exportar"
    },
    os: {
        ver: "os.ver",
        editar: "os.editar",
        criar: "os.criar",
        excluir: "os.excluir",
        exportar: "os.exportar",
        diagnosticoEditar: "os.diagnostico.editar",
        pagamentos: "os.pagamentos"
    },
    financeiro: {
        ver: "financeiro.ver",
        editar: "financeiro.editar",
        criar: "financeiro.criar",
        excluir: "financeiro.excluir",
        exportar: "financeiro.exportar"
    }
} as const;

export type PermissionKey = string;

export const ACCESS_AREAS = [
    { key: "funcionarios", label: "Funcionários" },
    { key: "clientes", label: "Clientes" },
    { key: "veiculos", label: "Veículos" },
    { key: "os", label: "Ordens de serviço" },
    { key: "financeiro", label: "Registros financeiros" }
] as const;

export type AccessAreaKey = (typeof ACCESS_AREAS)[number]["key"];

export const ACCESS_LEVELS = [
    { key: "none", label: "Nenhum" },
    { key: "ver", label: "Visualização" },
    { key: "editar", label: "Edição/cadastro" },
    { key: "exportar", label: "Exportação" },
    { key: "excluir", label: "Remoção" }
] as const;

export type AccessLevelKey = (typeof ACCESS_LEVELS)[number]["key"];

/** Route-level aliases. Area pages require edit/create, not view-only. */
export const ACCESS = {
    CLIENTES: PERMISSIONS.clientes.editar,
    VEICULOS: PERMISSIONS.veiculos.editar,
    OS: PERMISSIONS.os.editar,
    FUNCIONARIOS: PERMISSIONS.funcionarios.editar,
    FINANCEIRO: PERMISSIONS.financeiro.editar,
    SUPERADMIN: PERMISSIONS.SUPERADMIN,
    PONTO: "ponto",
    TERMINAL: PERMISSIONS.financeiro.editar
} as const;

export type AccessDigit = (typeof ACCESS)[keyof typeof ACCESS];

const AREA_KEYS: Record<AccessAreaKey, readonly string[]> = {
    funcionarios: [
        PERMISSIONS.funcionarios.ver,
        PERMISSIONS.funcionarios.editar,
        PERMISSIONS.funcionarios.criar,
        PERMISSIONS.funcionarios.excluir,
        PERMISSIONS.funcionarios.exportar,
        PERMISSIONS.funcionarios.pii
    ],
    clientes: [
        PERMISSIONS.clientes.ver,
        PERMISSIONS.clientes.editar,
        PERMISSIONS.clientes.criar,
        PERMISSIONS.clientes.excluir,
        PERMISSIONS.clientes.exportar,
        PERMISSIONS.clientes.pii
    ],
    veiculos: [
        PERMISSIONS.veiculos.ver,
        PERMISSIONS.veiculos.editar,
        PERMISSIONS.veiculos.criar,
        PERMISSIONS.veiculos.excluir,
        PERMISSIONS.veiculos.exportar
    ],
    os: [
        PERMISSIONS.os.ver,
        PERMISSIONS.os.editar,
        PERMISSIONS.os.criar,
        PERMISSIONS.os.excluir,
        PERMISSIONS.os.exportar,
        PERMISSIONS.os.diagnosticoEditar,
        PERMISSIONS.os.pagamentos
    ],
    financeiro: [
        PERMISSIONS.financeiro.ver,
        PERMISSIONS.financeiro.editar,
        PERMISSIONS.financeiro.criar,
        PERMISSIONS.financeiro.excluir,
        PERMISSIONS.financeiro.exportar
    ]
};

const KNOWN_KEYS = new Set<string>([
    PERMISSIONS.SUPERADMIN,
    PERMISSIONS.GERENTE,
    ...Object.values(AREA_KEYS).flat()
]);

function areaFullKeys(area: AccessAreaKey, includePii: boolean): string[] {
    return AREA_KEYS[area].filter((key) => includePii || !key.endsWith(".pii"));
}

const LEGACY_DIGIT_KEYS: Record<string, string[]> = {
    "2": areaFullKeys("clientes", false),
    "3": areaFullKeys("veiculos", false),
    "4": [...areaFullKeys("os", false), ...areaFullKeys("financeiro", false)],
    "5": areaFullKeys("funcionarios", false),
    "6": areaFullKeys("financeiro", false)
};

export function keysFromAreaLevel(area: AccessAreaKey, level: AccessLevelKey): string[] {
    const pack = AREA_KEYS[area];
    const ver = pack.find((key) => key.endsWith(".ver"));
    const editar = pack.find((key) => key.endsWith(".editar") && !key.includes("diagnostico"));
    const criar = pack.find((key) => key.endsWith(".criar"));
    const exportar = pack.find((key) => key.endsWith(".exportar"));
    const excluir = pack.find((key) => key.endsWith(".excluir"));
    const extras =
        area === "os" ? [PERMISSIONS.os.diagnosticoEditar, PERMISSIONS.os.pagamentos] : [];

    if (level === "none" || !ver) {
        return [];
    }

    if (level === "ver") {
        return [ver];
    }

    const editKeys = [ver, editar, criar, ...extras].filter((key): key is string => Boolean(key));

    if (level === "editar") {
        return editKeys;
    }

    if (level === "exportar") {
        return [...editKeys, exportar].filter((key): key is string => Boolean(key));
    }

    return [...editKeys, excluir].filter((key): key is string => Boolean(key));
}

export function areaLevelFromKeys(area: AccessAreaKey, keys: readonly string[]): AccessLevelKey {
    const set = new Set(keys);

    if (set.has(`${area}.excluir`)) {
        return "excluir";
    }

    if (set.has(`${area}.exportar`)) {
        return "exportar";
    }

    if (set.has(`${area}.editar`) || set.has(`${area}.criar`)) {
        return "editar";
    }

    if (set.has(`${area}.ver`)) {
        return "ver";
    }

    return "none";
}

export function keysFromAreaLevels(
    levels: Partial<Record<AccessAreaKey, AccessLevelKey>>,
    gerente = false
): string[] {
    const keys = new Set<string>();

    for (const area of ACCESS_AREAS) {
        for (const key of keysFromAreaLevel(area.key, levels[area.key] ?? "none")) {
            keys.add(key);
        }
    }

    const osLevel = levels.os ?? "none";

    if (osLevel !== "none") {
        keys.add(PERMISSIONS.funcionarios.ver);
        keys.add(PERMISSIONS.clientes.ver);
        keys.add(PERMISSIONS.veiculos.ver);
        keys.add(PERMISSIONS.financeiro.ver);
    }

    if (gerente) {
        keys.add(PERMISSIONS.GERENTE);

        for (const key of [
            ...areaFullKeys("funcionarios", true),
            ...areaFullKeys("clientes", true),
            ...areaFullKeys("veiculos", false),
            ...areaFullKeys("os", false),
            ...areaFullKeys("financeiro", false)
        ]) {
            keys.add(key);
        }
    } else {
        for (const key of [...keys]) {
            if (key.startsWith("funcionarios.") && key !== PERMISSIONS.funcionarios.ver) {
                keys.delete(key);
            }
        }
    }

    return [...keys].sort();
}

export function areaLevelsFromKeys(keys: readonly string[]): {
    levels: Record<AccessAreaKey, AccessLevelKey>;
    gerente: boolean;
} {
    const levels = {} as Record<AccessAreaKey, AccessLevelKey>;

    for (const area of ACCESS_AREAS) {
        levels[area.key] = areaLevelFromKeys(area.key, keys);
    }

    return {
        levels,
        gerente: keys.includes(PERMISSIONS.GERENTE)
    };
}

export const PRESET_CARGO_NAMES = ["Gerente", "Mecânico"] as const;

export function isPresetCargoName(nome: string): boolean {
    return (PRESET_CARGO_NAMES as readonly string[]).includes(nome.trim());
}

export const GERENTE_PERMISSIONS = [
    PERMISSIONS.GERENTE,
    ...areaFullKeys("funcionarios", true),
    ...areaFullKeys("clientes", true),
    ...areaFullKeys("veiculos", false),
    ...areaFullKeys("os", false),
    ...areaFullKeys("financeiro", false)
].sort();

export const MECANICO_PERMISSIONS = [
    PERMISSIONS.os.ver,
    PERMISSIONS.os.editar,
    PERMISSIONS.os.diagnosticoEditar,
    PERMISSIONS.funcionarios.ver,
    PERMISSIONS.clientes.ver,
    PERMISSIONS.veiculos.ver,
    PERMISSIONS.financeiro.ver
].sort();

export function serializePermissions(keys: readonly string[]): string {
    return JSON.stringify([...new Set(keys)].sort());
}

function parseJsonKeys(raw: string): string[] | null {
    const trimmed = raw.trim();

    if (!trimmed.startsWith("[")) {
        return null;
    }

    try {
        const parsed: unknown = JSON.parse(trimmed);

        if (!Array.isArray(parsed)) {
            return null;
        }

        return parsed.map((item) => String(item)).filter((item) => item !== "");
    } catch {
        return null;
    }
}

function parseLegacyDigits(raw: string): string[] | null {
    const trimmed = raw.trim();

    if (trimmed === "0") {
        return [PERMISSIONS.SUPERADMIN];
    }

    if (!/^[1-6]+$/.test(trimmed)) {
        return null;
    }

    const keys = new Set<string>();

    for (const digit of trimmed) {
        const mapped = LEGACY_DIGIT_KEYS[digit];

        if (!mapped) {
            continue;
        }

        for (const key of mapped) {
            keys.add(key);
        }
    }

    return [...keys].sort();
}

export function parsePermissions(nivelAcesso: string | null | undefined): string[] {
    const raw = String(nivelAcesso ?? "").trim();

    if (!raw) {
        return [];
    }

    const fromJson = parseJsonKeys(raw);

    if (fromJson) {
        return fromJson;
    }

    return parseLegacyDigits(raw) ?? [raw];
}

export function migrateNivelAcesso(nivelAcesso: string): string {
    const keys = parsePermissions(nivelAcesso);

    if (keys.includes(PERMISSIONS.SUPERADMIN)) {
        return serializePermissions([PERMISSIONS.SUPERADMIN]);
    }

    return serializePermissions(keys.filter((key) => KNOWN_KEYS.has(key)));
}

export function isSuperadmin(nivelAcesso: string): boolean {
    const keys = parsePermissions(nivelAcesso);

    return keys.includes(PERMISSIONS.SUPERADMIN) || String(nivelAcesso ?? "").includes("0");
}

export function isGerente(nivelAcesso: string): boolean {
    if (isSuperadmin(nivelAcesso)) {
        return true;
    }

    return parsePermissions(nivelAcesso).includes(PERMISSIONS.GERENTE);
}

export const ACCESS_LEVEL_HELP: Record<AccessLevelKey, string> = {
    none: "Sem acesso a esta área.",
    ver: "Vê dados em contexto, sem abrir o menu da área.",
    editar: "Abre a área, cadastra e edita registros.",
    exportar: "Exporta a tabela da área para PDF.",
    excluir: "Exclui ou desativa registros."
};

export function permissionToken(area: AccessAreaKey, level: AccessLevelKey): string {
    return `${area}:${level}`;
}

export function parsePermissionToken(token: string): { area: AccessAreaKey; level: AccessLevelKey } | null {
    const [area, level] = token.split(":");

    if (!ACCESS_AREAS.some((item) => item.key === area)) {
        return null;
    }

    if (!ACCESS_LEVELS.some((item) => item.key === level)) {
        return null;
    }

    return {
        area: area as AccessAreaKey,
        level: level as AccessLevelKey
    };
}

export function togglePermissionTokens(
    selected: readonly string[],
    area: AccessAreaKey,
    level: AccessLevelKey
): string[] {
    const prefix = `${area}:`;
    const other = selected.filter((token) => !token.startsWith(prefix));
    const areaTokens = selected.filter((token) => token.startsWith(prefix));
    const tokenFor = (lvl: AccessLevelKey) => permissionToken(area, lvl);
    const has = (lvl: AccessLevelKey) => areaTokens.includes(tokenFor(lvl));

    if (level === "exportar" || level === "excluir") {
        let nextArea = areaTokens.filter((token) => token !== tokenFor("none"));

        if (has(level)) {
            nextArea = nextArea.filter((token) => token !== tokenFor(level));

            if (nextArea.length === 0) {
                return [...other, tokenFor("none")];
            }

            return [...other, ...nextArea];
        }

        if (!has("ver")) {
            nextArea.push(tokenFor("ver"));
        }

        if (!has("editar")) {
            nextArea.push(tokenFor("editar"));
        }

        nextArea.push(tokenFor(level));

        return [...other, ...nextArea];
    }

    const next = selected.filter((token) => !token.startsWith(prefix));

    if (level === "none") {
        next.push(tokenFor("none"));
        return next;
    }

    next.push(tokenFor("ver"));

    if (level === "ver") {
        return next;
    }

    next.push(tokenFor("editar"));

    return next;
}

export function permissionTokensForArea(
    area: AccessAreaKey,
    keys: readonly string[]
): string[] {
    const verKey = `${area}.ver`;
    const editarKey = `${area}.editar`;
    const criarKey = `${area}.criar`;
    const exportKey = `${area}.exportar`;
    const excluirKey = `${area}.excluir`;
    const hasKey = (key: string) => keys.includes(key);

    const tokens = new Set<string>();

    if (
        hasKey(verKey)
        || hasKey(editarKey)
        || hasKey(criarKey)
        || hasKey(exportKey)
        || hasKey(excluirKey)
    ) {
        tokens.add(permissionToken(area, "ver"));
    }

    if (hasKey(editarKey) || hasKey(criarKey) || hasKey(exportKey) || hasKey(excluirKey)) {
        tokens.add(permissionToken(area, "editar"));
    }

    if (hasKey(exportKey)) {
        tokens.add(permissionToken(area, "exportar"));
    }

    if (hasKey(excluirKey)) {
        tokens.add(permissionToken(area, "excluir"));
    }

    if (tokens.size === 0) {
        return [permissionToken(area, "none")];
    }

    return [...tokens];
}

export function tokensFromPermissionKeys(keys: readonly string[]): string[] {
    const tokens: string[] = [];

    for (const area of ACCESS_AREAS) {
        tokens.push(...permissionTokensForArea(area.key, keys));
    }

    return tokens;
}

export function keysFromPermissionTokens(tokens: readonly string[]): string[] {
    const keys = new Set<string>();

    for (const area of ACCESS_AREAS) {
        const areaTokens = tokens.filter((token) => token.startsWith(`${area.key}:`));

        if (areaTokens.length === 0 || areaTokens.includes(permissionToken(area.key, "none"))) {
            continue;
        }

        const hasExport = areaTokens.includes(permissionToken(area.key, "exportar"));
        const hasExcluir = areaTokens.includes(permissionToken(area.key, "excluir"));
        const hasEditar = areaTokens.includes(permissionToken(area.key, "editar"));
        const hasVer = areaTokens.includes(permissionToken(area.key, "ver"));

        if (hasExcluir) {
            for (const key of keysFromAreaLevel(area.key, "excluir")) {
                keys.add(key);
            }
        }

        if (hasExport) {
            for (const key of keysFromAreaLevel(area.key, "exportar")) {
                keys.add(key);
            }
        }

        if (!hasExcluir && !hasExport && hasEditar) {
            for (const key of keysFromAreaLevel(area.key, "editar")) {
                keys.add(key);
            }
        }

        if (!hasExcluir && !hasExport && !hasEditar && hasVer) {
            for (const key of keysFromAreaLevel(area.key, "ver")) {
                keys.add(key);
            }
        }
    }

    const sorted = [...keys].sort();

    for (const key of [...sorted]) {
        if (key.startsWith("funcionarios.") && key !== PERMISSIONS.funcionarios.ver) {
            keys.delete(key);
        }
    }

    return [...keys].sort();
}

export function levelsFromPermissionTokens(
    tokens: readonly string[]
): Record<AccessAreaKey, AccessLevelKey> {
    const levels = {} as Record<AccessAreaKey, AccessLevelKey>;

    for (const area of ACCESS_AREAS) {
        const areaTokens = tokens.filter((token) => token.startsWith(`${area.key}:`));

        if (areaTokens.includes(permissionToken(area.key, "excluir"))) {
            levels[area.key] = "excluir";
        } else if (areaTokens.includes(permissionToken(area.key, "exportar"))) {
            levels[area.key] = "exportar";
        } else if (areaTokens.includes(permissionToken(area.key, "editar"))) {
            levels[area.key] = "editar";
        } else if (areaTokens.includes(permissionToken(area.key, "ver"))) {
            levels[area.key] = "ver";
        } else {
            levels[area.key] = "none";
        }
    }

    return levels;
}

export function tokensFromAreaLevels(
    levels: Partial<Record<AccessAreaKey, AccessLevelKey>>
): string[] {
    const tokens: string[] = [];

    for (const area of ACCESS_AREAS) {
        const level = levels[area.key] ?? "none";

        if (level === "none") {
            tokens.push(permissionToken(area.key, "none"));
            continue;
        }

        tokens.push(...togglePermissionTokens([], area.key, level));
    }

    return tokens;
}

export function hasPermission(nivelAcesso: string, key: string): boolean {
    if (isSuperadmin(nivelAcesso)) {
        return true;
    }

    return parsePermissions(nivelAcesso).includes(key);
}

/**
 * Route/page check. Superadmin grants everything.
 *
 * View-only keys do not open entity pages — `hasAccess` for an area page
 * should use the `.editar` (or `.criar`) key.
 */
export function hasAccess(nivelAcesso: string, permission: string): boolean {
    if (isSuperadmin(nivelAcesso)) {
        return true;
    }

    if (/^[0-6]$/.test(permission)) {
        const mapped = permission === "0" ? [PERMISSIONS.SUPERADMIN] : LEGACY_DIGIT_KEYS[permission];

        if (!mapped || mapped.length === 0) {
            return false;
        }

        return mapped.some((key) => hasPermission(nivelAcesso, key));
    }

    if (hasPermission(nivelAcesso, permission)) {
        return true;
    }

    if (permission.endsWith(".editar")) {
        const criar = permission.replace(/\.editar$/, ".criar");

        return hasPermission(nivelAcesso, criar);
    }

    return false;
}

export function canOpenArea(nivelAcesso: string, area: AccessAreaKey): boolean {
    return hasAccess(nivelAcesso, `${area}.editar`) || hasAccess(nivelAcesso, `${area}.criar`);
}

export function isKnownPermission(key: string): boolean {
    return KNOWN_KEYS.has(key);
}

export function normalizeNivelAcesso(value: unknown): string {
    if (Array.isArray(value)) {
        return migrateNivelAcesso(serializePermissions(value.map((item) => String(item))));
    }

    return migrateNivelAcesso(String(value ?? ""));
}
