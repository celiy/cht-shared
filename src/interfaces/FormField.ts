export interface FormField {
    id: string;
    label: string;
    type: 'text' | 'email' | 'phone' | 'cpf' | 'cnpj' | 'cep' | 'password' | 'number' | 'money' | 'date' | 'textarea' | 'checkbox' | 'radio' | 'select';
    section?: string;
    group?: string;
    name?: string;
    placeholder?: string;
    /** Exibe ação de copiar (não combina com `type: 'password'`, que usa alternar visibilidade). */
    copiable?: boolean;
    helperText?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    variant?: string;
    /** Apenas para `type: 'checkbox'`: visual de caixa ou switch. */
    checkboxStyle?: 'normal' | 'switch';
    maxSize?: number;
    minSize?: number;
    inputClass?: object | string;
    textMask?: string;
    description?: string;
    checked?: boolean;
    value?: any;
    options?: {
        label: string;
        value: string;
        description?: string;
    }[];
    cols?: number;
    condition?: {
        field: string;
        value?: any;
        operator?: 'eq' | 'neq' | 'cnpj';
    };
    /**
     * Extra button beside a `type: "select"` trigger (same style as the select).
     */
    selectAction?: {
        icon?: string;
        label?: string;
        side?: "left" | "right";
        tooltip?: string;
    };
    /** Passed to Select when `type` is `"select"`. */
    selectMultiple?: {
        min?: number;
        max?: number;
        allSelected?: boolean;
    };
    /**
     * Multi-select: selected options appear as chips below the trigger
     * (`Select` `separateSelected`).
     */
    selectSeparateSelected?: boolean;
    /**
     * Search for `type: "select"`. When `external` is true, typing emits
     * `search:external` with `{ field, value }` instead of filtering locally.
     */
    selectSearch?: {
        external: boolean;
        field?: string;
    };
}